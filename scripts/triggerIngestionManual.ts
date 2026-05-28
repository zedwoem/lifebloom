import './loadEnv';
import { ingestRSSFeeds, processPendingArticlesBatch } from '../src/lib/services/rssService';

async function runIngestion() {
  console.log("🚀 Starting manual RSS Ingestion...");
  try {
    const ingestResult = await ingestRSSFeeds();
    console.log(`✅ Ingestion finished. Queued: ${ingestResult.processed} articles, duplicates blocked: ${ingestResult.duplicates_blocked}, YouTube videos added: ${ingestResult.youtube_videos_added}`);
    
    console.log("🚀 Processing pending articles queue...");
    const processResult = await processPendingArticlesBatch(15);
    console.log(`✅ Batch processing finished. Successfully processed: ${processResult.processed} articles`);
    if (processResult.errors.length > 0) {
      console.warn(`⚠️ Errors encountered during processing:\n`, processResult.errors.join('\n'));
    }
  } catch (err: any) {
    console.error("❌ Fatal error during manual ingestion:", err);
    process.exit(1);
  }
}

runIngestion();
