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

async function checkArticles() {
  const { data, error, count } = await supabase
    .from('canonical_articles')
    .select('id, title, processing_status, pillar', { count: 'exact' });

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Total articles found: ${count}`);
  if (data && data.length > 0) {
    const statusCounts = data.reduce((acc: any, curr: any) => {
      acc[curr.processing_status] = (acc[curr.processing_status] || 0) + 1;
      return acc;
    }, {});
    console.log("Status breakdown:", statusCounts);
    
    console.log("\nSample articles:");
    data.slice(0, 5).forEach(a => console.log(`- [${a.processing_status}] (${a.pillar}) ${a.title}`));
  } else {
    console.log("No articles found in the database.");
  }
}

checkArticles();
