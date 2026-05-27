import * as dotenv from 'dotenv';

// When running as a standalone script (e.g. from CLI during CI/CD or build checks)
// we manually load the environment variables. 
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export interface HealthCheckResult {
  provider: string;
  status: 'OK' | 'ERROR';
  latencyMs?: number;
  message?: string;
}

/**
 * Pings all 4 AI providers (Groq, Gemini, DeepSeek, OpenRouter) 
 * with a minimal payload to ensure they are online and quotas are active.
 */
export async function pingAllAiProviders(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];

  const providers = [
    { name: 'Groq (LPU)', check: pingGroq },
    { name: 'Gemini (15 RPM)', check: pingGemini },
    { name: 'DeepSeek (5M Token)', check: pingDeepSeek },
    { name: 'OpenRouter (Fallback)', check: pingOpenRouter }
  ];

  for (const provider of providers) {
    const start = Date.now();
    try {
      const isOk = await provider.check();
      const latency = Date.now() - start;
      if (isOk) {
        results.push({ provider: provider.name, status: 'OK', latencyMs: latency });
      } else {
        results.push({ provider: provider.name, status: 'ERROR', message: 'API responded but parsing failed.' });
      }
    } catch (e: any) {
      results.push({ provider: provider.name, status: 'ERROR', message: e.message || 'Connection failed' });
    }
  }

  return results;
}

// Minimal Payload to cost almost 0 tokens
const MINIMAL_PROMPT = 'Reply with exactly 1 word: "OK"';

async function pingGroq(): Promise<boolean> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("Missing XAI_API_KEY");

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: MINIMAL_PROMPT }],
      max_tokens: 5
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return true;
}

async function pingGemini(): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: MINIMAL_PROMPT }] }],
      generationConfig: { maxOutputTokens: 5 }
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return true;
}

async function pingDeepSeek(): Promise<boolean> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY");

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: MINIMAL_PROMPT }],
      max_tokens: 5
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return true;
}

async function pingOpenRouter(): Promise<boolean> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`, 
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lifebloomhub.vercel.app',
      'X-Title': 'LifeBloom Hub Check'
    },
    body: JSON.stringify({
      model: 'google/gemma-4-31b-it:free',
      messages: [{ role: 'user', content: MINIMAL_PROMPT }],
      max_tokens: 5
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return true;
}


// Self-execution block if run via command line (e.g., `tsx src/lib/services/healthCheck.ts` or `ts-node`)
const isMain = process.argv[1]?.includes('healthCheck');
if (isMain) {
  console.log("Running AI Providers Health Check...");
  pingAllAiProviders().then(results => {
    let allOk = true;
    console.table(results);
    for (const r of results) {
      if (r.status !== 'OK') allOk = false;
    }
    if (!allOk) {
      console.error("\n❌ [CRITICAL] One or more AI providers are DOWN or exhausted. Pipeline aborted.");
      process.exit(1);
    } else {
      console.log("\n✅ All AI providers are ONLINE. Pipeline is safe to run.");
      process.exit(0);
    }
  }).catch(e => {
    console.error("Health check execution failed:", e);
    process.exit(1);
  });
}
