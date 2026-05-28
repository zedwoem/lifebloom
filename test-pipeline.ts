const { createServiceClient } = require('@/lib/supabase/server');
const { processPendingArticlesBatch } = require('@/lib/services/rssService');

async function testPipeline() {
  console.log("Testing article pipeline...");
  const res = await processPendingArticlesBatch(1);
  console.log("Pipeline result:", res);
}
testPipeline().catch(console.error);
