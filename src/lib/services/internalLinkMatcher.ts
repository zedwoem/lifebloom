import { generateAIResponse } from './aiOrchestrator';

/**
 * internalLinkMatcher.ts
 * 
 * Programmatic SEO Engine: Injects internal links into content dynamically.
 * Features:
 * - Chunking (potong 3-4 paragraf) to keep Groq accurate and token-efficient.
 * - excludeList to prevent infinite link loops (e.g., A -> B -> A).
 */

export interface SiteLink {
  keyword: string;
  url: string;
}

export async function matchInternalLinks(
  draftHtml: string, 
  currentUrl: string, 
  availableLinks: SiteLink[]
): Promise<string> {
  // 1. Chunking: Memecah draftHtml menjadi potongan kecil (~3 paragraf)
  // Ini merupakan pendekatan sederhana menggunakan double newline.
  // Untuk HTML kompleks, gunakan library parser seperti cheerio, namun untuk string ini cukup.
  const paragraphs = draftHtml.split('\n\n').filter(p => p.trim() !== '');
  
  const CHUNK_SIZE = 3;
  const chunks: string[] = [];
  for (let i = 0; i < paragraphs.length; i += CHUNK_SIZE) {
    chunks.push(paragraphs.slice(i, i + CHUNK_SIZE).join('\n\n'));
  }

  // 2. excludeList: Buang currentUrl dari daftar target yang tersedia
  const safeLinks = availableLinks.filter(link => link.url !== currentUrl);
  
  if (safeLinks.length === 0) {
    return draftHtml; // Tidak ada link yang bisa dipasang
  }

  const systemPrompt = `Anda adalah Ahli Programmatic SEO (pSEO). Tugas Anda adalah menyuntikkan tautan internal (tag <a> HTML) ke dalam draf konten yang diberikan.
  
ATURAN MUTLAK:
1. Hanya gunakan daftar tautan berikut: ${JSON.stringify(safeLinks)}
2. DILARANG memasukkan tautan yang mengarah ke URL berikut (excludeList): ${currentUrl}
3. Cukup suntikkan 1-2 tautan secara natural ke dalam teks. Jangan merusak struktur HTML.
4. JANGAN mengubah makna kalimat. Hanya tambahkan tag <a href="..."> di sekeliling kata kunci yang paling relevan.
5. Kembalikan teks asli yang telah disuntikkan tautan, TANPA tambahan komentar.`;

  // 3. Eksekusi per chunk menggunakan Groq via Orchestrator
  let processedHtml = '';
  
  for (const chunk of chunks) {
    try {
      const result = await generateAIResponse({
        systemPrompt,
        userPrompt: chunk,
        requireJson: false
      }, 'pseo_clustering', 'high'); // Menggunakan pseo_clustering untuk mengakses tier Groq
      
      if (result) {
        processedHtml += result + '\n\n';
      } else {
        processedHtml += chunk + '\n\n'; // Fallback jika LPU gagal
      }
    } catch (error) {
      console.warn('[InternalLinkMatcher] Chunk failed, using original text.', error);
      processedHtml += chunk + '\n\n';
    }
  }

  return processedHtml.trim();
}
