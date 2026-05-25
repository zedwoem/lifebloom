import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  // === SECURITY CHECK: Prevent external scraping ===
  const referer = request.headers.get("referer") || "";
  const origin = request.headers.get("origin") || "";
  const allowedHost = process.env.NEXT_PUBLIC_BASE_URL || "lifebloomhub.com";
  
  if (!referer.includes(allowedHost) && !origin.includes(allowedHost)) {
    console.warn(`[SECURITY] Blocked unauthorized TTS request from Origin: ${origin}, Referer: ${referer}`);
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { text, locale } = await request.json();
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    const filename = `${locale || "en"}/${hash}.mp3`;

    // 1. Check Supabase Storage Cache
    const { data: fileData, error: fileError } = await supabase.storage
      .from("tts-cache")
      .download(filename);

    if (!fileError && fileData) {
      // Return cached file
      return new NextResponse(fileData, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "TTS Service Unavailable (Missing API Key)" }, { status: 503 });
    }

    // 2. Fetch from ElevenLabs (Stream)
    // Multilingual Wavenet model: elevelabs v2 multilingual
    const voiceId = locale === "id" ? "EXAVITQu4vr4xnSDxMaL" : "21m00Tcm4TlvDq8ikWAM"; // Example voices

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok || !response.body) {
      const errText = await response.text();
      console.error("ElevenLabs Error:", errText);
      return NextResponse.json({ error: "TTS Generation Failed" }, { status: 500 });
    }

    // 3. Chunked Transfer Encoding Stream 
    // We tee the stream so we can return one to the client instantly, and buffer the other to save to Supabase.
    const [clientStream, storageStream] = response.body.tee();

    // Fire & Forget background task to upload to Supabase Storage
    const uploadToStorage = async () => {
      try {
        const chunks: Uint8Array[] = [];
        const reader = storageStream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        
        // Combine chunks
        const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const c of chunks) {
          combined.set(c, offset);
          offset += c.length;
        }

        const buffer = Buffer.from(combined);
        await supabase.storage.from("tts-cache").upload(filename, buffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });
      } catch (err) {
        console.error("Failed to cache TTS stream to Supabase:", err);
      }
    };

    // Use edge runtime 'waitUntil' equivalent to run upload in background
    if (typeof (request as any).waitUntil === 'function') {
        (request as any).waitUntil(uploadToStorage());
    } else {
        // Fallback for NextJS standard node env if not perfectly polyfilled
        uploadToStorage().catch(console.error);
    }

    return new NextResponse(clientStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error: any) {
    console.error("TTS Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
