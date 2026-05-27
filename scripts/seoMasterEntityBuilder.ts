import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { generateAIResponse } from '../src/lib/services/aiOrchestrator';

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

/**
 * seoMasterEntityBuilder.ts
 * 
 * Skrip ini dipanggil sekali (one-off) untuk membangun master entity graph.
 * Output akan disimpan ke public/data/seo-graph.json agar dapat diakses
 * instan (O(1)) oleh layout.tsx (Entity-First Publishing).
 */
async function buildMasterEntity() {
  console.log("🚀 Memulai proses Semantic Siloing (DeepSeek Upfront)...");
  
  const systemPrompt = `Anda adalah Master SEO Architect. Tugas Anda adalah membangun graph entitas semantik untuk portal "LifeBloom Hub" yang mencakup pilar: Smart Living, Accessible Travel, Retirement, Pet Safety, dan Medical Checking.
Hasilkan JSON terstruktur berisi struktur Pillar (Pillar Name -> Sub-topics -> Hub URLs) yang saling terkait.`;

  const userPrompt = `Buatlah Master Entity Graph dalam format JSON murni dengan struktur: 
  {
    "entities": [
      { "id": "smart-living", "name": "Smart Living", "related": ["retirement", "accessible-travel"], "priority": 1.0 },
      ...
    ],
    "hubs": [
      { "path": "/smart-living", "entityId": "smart-living", "keywords": ["smart home for seniors", "matter compatibility"] }
    ]
  }
  Hanya kembalikan JSON, tanpa markdown.`;

  try {
    const rawResult = await generateAIResponse({
      systemPrompt,
      userPrompt,
      requireJson: true
    }, 'seo_architecture', 'high');

    if (!rawResult) {
      throw new Error("Orchestrator mengembalikan nilai null. Semua fallback gagal (kemungkinan rate limit / insufficient balance).");
    }

    // Ekstrak JSON jika DeepSeek/Gemini merespons dengan markdown block ```json
    let cleanJson = rawResult;
    const jsonMatch = rawResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      cleanJson = jsonMatch[1];
    }

    // Validasi
    const parsed = JSON.parse(cleanJson);

    // Simpan ke public/data/seo-graph.json
    const outDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outFile = path.join(outDir, 'seo-graph.json');
    fs.writeFileSync(outFile, JSON.stringify(parsed, null, 2), 'utf-8');
    
    console.log(`✅ Master Entity Graph berhasil dibangun dan disimpan ke: ${outFile}`);
  } catch (error) {
    console.error("❌ Gagal membangun Master Entity Graph:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildMasterEntity();
}
