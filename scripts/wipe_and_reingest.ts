import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeAndReingest() {
  console.log("1. Wiping old articles...");
  
  // Wipe translation and canonical tables
  const { error: err1 } = await supabase.from('translated_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.warn("Note during wiping translated_articles:", err1.message);

  const { error: err2 } = await supabase.from('canonical_articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.warn("Note during wiping canonical_articles:", err2.message);

  console.log("Successfully wiped database tables.");

  console.log("2. Ingesting fresh live RSS feeds...");
  const { ingestRSSFeeds } = await import('../src/lib/services/rssService');
  const result = await ingestRSSFeeds();
  
  console.log("\nRe-ingest complete!");
  console.log(`Processed feeds: ${result.processed} new articles pending.`);
  console.log(`YouTube videos added: ${result.youtube_videos_added}`);
  console.log(`Duplicates blocked: ${result.duplicates_blocked}`);
}

wipeAndReingest();
