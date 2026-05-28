import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  console.log("Starting batch processing of 25 articles...");
  try {
    const { processPendingArticlesBatch } = await import('../src/lib/services/rssService');
    const result = await processPendingArticlesBatch(25);
    console.log("Batch processing result:", result);
  } catch (err) {
    console.error("Error processing batch:", err);
  }
}

run();
