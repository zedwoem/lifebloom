const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: allArticles } = await supabase.from('canonical_articles').select('pillar, processing_status');
  const counts = allArticles?.reduce((acc, curr) => {
    const key = `${curr.pillar}_${curr.processing_status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}) || {};
  
  console.log("Canonical Articles counts by Pillar & Status:");
  console.log(counts);
  
  const { data: allVideos } = await supabase.from('videos').select('pillar');
  const vidCounts = allVideos?.reduce((acc, curr) => {
    acc[curr.pillar] = (acc[curr.pillar] || 0) + 1;
    return acc;
  }, {}) || {};
  
  console.log("Videos counts by Pillar:");
  console.log(vidCounts);
}
checkData();
