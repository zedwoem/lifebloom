import { generateAIResponse } from './aiOrchestrator';

/**
 * trendAnalysisService.ts
 * 
 * Programmatic SEO Engine: Clustering keywords based on intent and semantic relation.
 * Uses Groq LPU via Orchestrator for ultra-fast JSON generation.
 */

export interface KeywordCluster {
  primaryKeyword: string;
  intent: 'Informational' | 'Transactional' | 'Navigational' | 'Commercial';
  secondaryKeywords: string[];
  suggestedHub: string;
}

export async function clusterKeywords(rawKeywords: string[]): Promise<KeywordCluster[]> {
  if (!rawKeywords || rawKeywords.length === 0) return [];

  const systemPrompt = `Anda adalah Senior Data Analyst & pSEO Engineer. 
Tugas Anda adalah mengklasifikasikan dan mengelompokkan daftar kata kunci (keywords) mentah ke dalam klaster semantik yang sangat terstruktur.

ATURAN OUTPUT:
1. Anda HANYA boleh mengembalikan output dalam format JSON array murni.
2. Setiap objek dalam array harus memiliki struktur berikut:
   {
     "primaryKeyword": "string (kata kunci utama)",
     "intent": "Informational | Transactional | Navigational | Commercial",
     "secondaryKeywords": ["string", "string"],
     "suggestedHub": "smart-living | accessible-travel | retirement | pet-safety | medical-checking"
   }
3. DILARANG menambahkan teks, penjelasan, atau blok markdown di luar JSON.`;

  const userPrompt = `Daftar kata kunci mentah:\n${rawKeywords.join(', ')}`;

  try {
    const rawResult = await generateAIResponse({
      systemPrompt,
      userPrompt,
      requireJson: true
    }, 'pseo_clustering', 'high');

    if (!rawResult) {
      console.warn('[TrendAnalysis] AI Orchestrator returned null. Returning empty array.');
      return [];
    }

    // Ekstrak JSON jika AI membalas dengan markdown block
    let cleanJson = rawResult;
    const jsonMatch = rawResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      cleanJson = jsonMatch[1];
    }

    const parsed: KeywordCluster[] = JSON.parse(cleanJson);
    return parsed;
  } catch (error) {
    console.error('[TrendAnalysis] Failed to cluster keywords:', error);
    return [];
  }
}
