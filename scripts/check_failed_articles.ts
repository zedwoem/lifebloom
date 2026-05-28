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

async function checkFailedArticles() {
  const { data, error } = await supabase
    .from('canonical_articles')
    .select('id, title, processing_error')
    .eq('processing_status', 'failed')
    .limit(10);

  if (error) {
    console.error("Error fetching failed articles:", error);
    return;
  }

  console.log(`Failed Articles Sample (Out of 29):`);
  data.forEach((a, i) => {
    console.log(`\n${i+1}. "${a.title}"`);
    console.log(`   Error: ${a.processing_error}`);
  });
}

checkFailedArticles();
