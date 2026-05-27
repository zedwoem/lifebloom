import { sendEmail } from '@/lib/services/emailService';

/**
 * REFINED FINOPS ORCHESTRATOR
 * Zero-Cost Capability Arbitrage System
 * Menghindari Blocking Sleep & Menambahkan Circuit Breaker Terpusat
 */

export type TaskType = 'pseo_clustering' | 'content_generation' | 'seo_architecture' | 'translation_ondemand';
export type Priority = 'high' | 'low';

export interface AIRequestPayload {
  systemPrompt: string;
  userPrompt: string;
  requireJson?: boolean;
}

// In-Memory Circuit Breaker State
// Catatan: Untuk deployment Vercel multi-region, state in-memory ini bersifat per-instance. 
// Untuk sinkronisasi global yang absolut, pindahkan ke Redis/Upstash (KV).
const circuitBreaker = {
  openRouterCallsToday: 0,
  lastReset: new Date().toDateString(),
  
  check(): boolean {
    const today = new Date().toDateString();
    if (today !== this.lastReset) {
      this.openRouterCallsToday = 0;
      this.lastReset = today;
    }
    return this.openRouterCallsToday < 45;
  },

  async increment() {
    this.openRouterCallsToday++;
    
    // Log Warning Notification at exactly 40 calls
    if (this.openRouterCallsToday === 40) {
      console.warn('[CRITICAL WARNING] OpenRouter calls reached 40/day limit threshold!');
      await sendEmail({
        to: 'muhzadit@gmail.com',
        subject: '⚠️ ACTION REQUIRED: LifeBloom Hub AI FinOps Alert',
        html: `
          <h3>OpenRouter Fallback Exhaustion Warning</h3>
          <p>The system is currently operating heavily on its last-resort fallback (OpenRouter).</p>
          <p><strong>OpenRouter calls today: 40/45.</strong></p>
          <p>Please check the health of Groq and Gemini immediately as they seem to be failing repeatedly.</p>
        `
      }).catch(err => console.error("Failed to send FinOps warning email", err));
    }
  }
};

/**
 * Panggil API Groq
 */
async function callGroqLPU(payload: AIRequestPayload): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("Missing XAI_API_KEY (Groq)");

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: payload.systemPrompt },
        { role: 'user', content: payload.userPrompt }
      ],
      response_format: payload.requireJson ? { type: 'json_object' } : undefined,
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!res.ok) throw new Error(`Groq Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

/**
 * Panggil API Gemini
 */
async function callGemini(payload: AIRequestPayload): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const prompt = `${payload.systemPrompt}\n\n${payload.userPrompt}`;
  
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: payload.requireJson ? {
          responseMimeType: 'application/json'
        } : undefined
      }),
      signal: AbortSignal.timeout(12000)
    }
  );

  if (!res.ok) throw new Error(`Gemini Error: ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * Panggil API DeepSeek
 */
async function callDeepSeek(payload: AIRequestPayload): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY");

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: payload.systemPrompt },
        { role: 'user', content: payload.userPrompt }
      ],
      response_format: payload.requireJson ? { type: 'json_object' } : undefined,
      temperature: 0.1
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) throw new Error(`DeepSeek Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

/**
 * Panggil API OpenRouter (The Last Resort)
 */
async function callOpenRouterFree(payload: AIRequestPayload): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app',
      'X-Title': 'LifeBloom Hub'
    },
    body: JSON.stringify({
      model: 'google/gemma-4-31b-it:free', // Default free fallback model
      messages: [
        { role: 'system', content: payload.systemPrompt },
        { role: 'user', content: payload.userPrompt }
      ],
      response_format: payload.requireJson ? { type: 'json_object' } : undefined,
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!res.ok) throw new Error(`OpenRouter Error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}


/**
 * Unified AI Response Generator with Zero-Cost Arbitrage Routing
 */
export async function generateAIResponse(
  payload: AIRequestPayload, 
  taskType: TaskType, 
  priority: Priority = 'low'
): Promise<string | null> {
  
  // ==========================================
  // TIER 1: DATA-DRIVEN & ON-DEMAND (GROQ)
  // ==========================================
  if (taskType === 'pseo_clustering' || taskType === 'translation_ondemand') {
    try {
      return await callGroqLPU(payload);
    } catch (e) {
      console.error('[Orchestrator] Groq Fail, Cascading to Gemini', e);
      try {
        return await callGemini(payload);
      } catch (geminiError) {
        console.error('[Orchestrator] Gemini Fail in Tier-1 Fallback', geminiError);
        // Cascade ke Tier-3 jika on-demand
        if (taskType === 'translation_ondemand') {
          if (circuitBreaker.check()) {
            await circuitBreaker.increment();
            try {
              return await callOpenRouterFree(payload);
            } catch (openRouterErr) {
              console.error('[CRITICAL] OpenRouter also failed!', openRouterErr);
              return null;
            }
          } else {
            console.error('[CRITICAL] OpenRouter Budget Exhausted! (Limit 45 calls reached)');
            return null;
          }
        }
        return null;
      }
    }
  }

  // ==========================================
  // TIER 2: UPFRONT SEO ARCHITECTURE (DEEPSEEK)
  // ==========================================
  if (taskType === 'seo_architecture') {
    try {
      return await callDeepSeek(payload); 
    } catch (e) {
      console.error('[Orchestrator] DeepSeek Fail, Fallback to Gemini', e);
      try {
        return await callGemini(payload);
      } catch (geminiErr) {
        console.error('[Orchestrator] Gemini also failed in SEO Architecture', geminiErr);
        return null; // Fail-silent
      }
    }
  }

  // ==========================================
  // HEAVY LIFTING (GEMINI ONLY) - Background Tasks
  // ==========================================
  if (taskType === 'content_generation') {
    try {
      return await callGemini(payload);
    } catch (e) {
      console.error('[Orchestrator] Content Generation failed via Gemini', e);
      // NOTE: Tidak menggunakan fallback karena ini tugas berat
      // Sebagai gantinya, panggil fungsi ini dari worker Queue (Vercel/QStash)
      // agar otomatis di-retry jika gagal. 
      return null;
    }
  }

  return null;
}
