import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Redis } from "https://esm.sh/@upstash/redis@1.28.0";

// --- Configuration & Constants --- //
const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const IDEMPOTENCY_WINDOW_HOURS = 3; 

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailure: number;
}

// --- Resilience Helpers --- //

async function checkRedisHealth(redisUrl: string, redisToken: string): Promise<Redis | null> {
  try {
    const redis = new Redis({ url: redisUrl, token: redisToken });
    // Simple health check
    await redis.ping();
    console.log("[Redis] Connection healthy.");
    return redis;
  } catch (err) {
    console.warn("[Redis] Health check failed. Falling back to Supabase DB cache.", err.message);
    return null;
  }
}

async function sendAlert(webhookUrl: string, message: string) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `🚨 **LifeBloom Alert**: ${message}` })
    });
  } catch (err) {
    console.error("[Alert] Failed to send webhook alert:", err.message);
  }
}

async function withCircuitBreaker<T>(
  serviceName: string,
  redis: Redis | null,
  supabase: any,
  fn: () => Promise<T>,
  alertWebhook?: string
): Promise<T> {
  const key = `circuit:${serviceName}`;
  let state: CircuitState = { state: 'CLOSED', failures: 0, lastFailure: 0 };

  // Fetch state from Redis or Supabase
  if (redis) {
    const data = await redis.get<CircuitState>(key);
    if (data) state = data;
  } else {
    const { data } = await supabase.from('circuit_breakers').select('*').eq('service_name', serviceName).maybeSingle();
    if (data) {
      state = { state: data.state as any, failures: data.failure_count, lastFailure: new Date(data.last_failure).getTime() };
    }
  }

  // Check state
  if (state.state === 'OPEN') {
    if (Date.now() - state.lastFailure > RECOVERY_TIMEOUT) {
      state.state = 'HALF_OPEN'; 
    } else {
      throw new Error(`Circuit breaker OPEN for ${serviceName}. Traffic blocked.`);
    }
  }

  try {
    const result = await fn();
    // Success -> Reset circuit
    state.failures = 0;
    state.state = 'CLOSED';
    
    if (redis) await redis.set(key, state);
    await supabase.from('circuit_breakers').upsert({
      service_name: serviceName, state: state.state, failure_count: state.failures, last_failure: null
    });
    return result;
  } catch (error) {
    // Failure -> Trip circuit
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= FAILURE_THRESHOLD) {
      state.state = 'OPEN';
      const msg = `Circuit Breaker for ${serviceName} is now OPEN after ${state.failures} consecutive failures. Reason: ${error.message}`;
      console.error(msg);
      if (alertWebhook) await sendAlert(alertWebhook, msg);
    }

    if (redis) await redis.set(key, state);
    await supabase.from('circuit_breakers').upsert({
      service_name: serviceName, state: state.state, failure_count: state.failures, last_failure: new Date(state.lastFailure).toISOString()
    });
    throw error;
  }
}

// --- Main Edge Function Handler --- //

serve(async (req) => {
  try {
    // 1. Strict Security Hardening: Require Valid Service Role JWT
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!authHeader || !authHeader.startsWith("Bearer ") || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header." }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== serviceKey) {
      return new Response(JSON.stringify({ error: "Unauthorized. Valid Service Role JWT required." }), { status: 403 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabase = createClient(supabaseUrl, serviceKey);
    const alertWebhook = Deno.env.get("DISCORD_WEBHOOK_URL");

    // 2. Enhanced Idempotency & Rate Limiting
    const { data: stateData } = await supabase
      .from('scheduler_state')
      .select('last_attempt, last_successful_run, status')
      .eq('job_name', 'ingest_job')
      .maybeSingle();

    const now = new Date();

    if (stateData) {
      // Check last successful run
      if (stateData.last_successful_run) {
        const hoursSinceSuccess = (now.getTime() - new Date(stateData.last_successful_run).getTime()) / 3600000;
        if (hoursSinceSuccess < IDEMPOTENCY_WINDOW_HOURS) {
          return new Response(JSON.stringify({ 
            message: `Rate limited / Idempotency check. Last successful run was ${hoursSinceSuccess.toFixed(1)} hours ago.` 
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }
      // Check last attempt to prevent rapid firing if in failure loop
      if (stateData.last_attempt && stateData.status === 'failed') {
        const minsSinceFail = (now.getTime() - new Date(stateData.last_attempt).getTime()) / 60000;
        if (minsSinceFail < 15) {
          return new Response(JSON.stringify({ 
            error: "Too many recent failed attempts. Backing off for 15 minutes." 
          }), { status: 429, headers: { "Content-Type": "application/json" } });
        }
      }
    }

    // Mark attempt
    await supabase.from('scheduler_state').upsert({ 
      job_name: 'ingest_job', 
      last_attempt: now.toISOString(),
      status: 'running'
    });

    // 3. Upstash Redis + Fallback Strategy Initialization
    const upstashUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
    const upstashToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
    let redis: Redis | null = null;
    
    if (upstashUrl && upstashToken) {
      redis = await checkRedisHealth(upstashUrl, upstashToken);
    }

    // 4. Trigger Vercel worker within Circuit Breaker
    const appUrl = Deno.env.get("APP_URL") || "https://lifebloomhub.vercel.app";
    const cronSecret = Deno.env.get("CRON_SECRET") || "fallback_secret";

    try {
      const ingestData = await withCircuitBreaker('vercel-ingest-api', redis, supabase, async () => {
         const res = await fetch(`${appUrl}/api/cron/ingest`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${cronSecret}` }
         });
         if (!res.ok) {
           throw new Error(`Vercel worker failed with status ${res.status}`);
         }
         return await res.json();
      }, alertWebhook);

      // 5. Update Idempotency State on Success
      await supabase.from('scheduler_state').upsert({ 
        job_name: 'ingest_job', 
        last_successful_run: new Date().toISOString(),
        status: 'success',
        error_message: null
      });

      // 6. Monitoring & Alerts: GNews Usage Warning
      // Example ingestData might return gnews_calls. Let's query DB for total today.
      const { data: usageData } = await supabase
        .from('api_usage_logs')
        .select('count')
        .eq('service', 'gnews_api')
        .gte('timestamp', new Date(now.setHours(0,0,0,0)).toISOString());
      
      const totalGNewsToday = usageData ? usageData.reduce((acc, row) => acc + row.count, 0) : 0;
      
      if (totalGNewsToday > 80 && alertWebhook) {
        await sendAlert(alertWebhook, `⚠️ GNews API usage is at ${totalGNewsToday}/100 for today. Nearing free-tier limit.`);
      }

      await supabase.from('api_usage_logs').insert({
        service: 'ingest-cron-run', count: 1, details: { source: 'edge-function', result: ingestData }
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Hybrid Ingestion triggered & managed successfully.",
        details: ingestData 
      }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (workerError) {
      // Mark as failed in idempotency table
      await supabase.from('scheduler_state').upsert({ 
        job_name: 'ingest_job', 
        status: 'failed',
        error_message: workerError.message
      });
      throw workerError;
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
