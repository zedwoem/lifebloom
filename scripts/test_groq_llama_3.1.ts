import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGroq() {
  const apiKey = process.env.XAI_API_KEY;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "You must return a JSON: {\"message\": \"Hello\"}" }],
        response_format: { type: "json_object" }
      })
    });
    console.log("Status:", res.status);
    const body = await res.json();
    console.log("Body:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

testGroq();
