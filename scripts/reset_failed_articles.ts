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

async function resetFailedArticles() {
  console.log("Resetting failed articles to pending...");
  const { data, error, count } = await supabase
    .from('canonical_articles')
    .update({ 
      processing_status: 'pending',
      processing_error: null 
    })
    .in('processing_status', ['failed', 'processing'])
    .select('id', { count: 'exact' });

  if (error) {
    console.error("Error resetting articles:", error);
    return;
  }

  console.log(`Successfully reset ${count} failed articles back to 'pending' status!`);
}

resetFailedArticles();
