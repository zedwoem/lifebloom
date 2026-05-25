// supabase/functions/price-sync/index.ts
// Supabase Edge Function — Daily Affiliate Price Synchronization (Deno Runtime)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

serve(async (req) => {
  // 1. Verify Request Origin & Authorization (Cron Token)
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized cron session' }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? "";
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // 3. Fetch active products from database
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, slug, vendor, price, original_price')
      .eq('is_active', true);

    if (fetchError || !products) {
      throw fetchError || new Error("No active products retrieved");
    }

    const updatedProducts = [];
    
    // 4. Batch process price lookups (Simulated Affiliate API responses)
    for (const product of products) {
      let currentPrice = Number(product.price);
      let originalPrice = product.original_price ? Number(product.original_price) : currentPrice;

      // Simulate network request to affiliate vendor API (Amazon Associates / Chewy / etc.)
      // In production, invoke actual REST API endpoints for Amazon PA-API or Impact Radius
      const randomFluctuation = (Math.random() - 0.5) * 2; // +/- 2% price change
      currentPrice = Math.max(0, parseFloat((currentPrice * (1 + randomFluctuation / 100)).toFixed(2)));

      const { error: updateError } = await supabase
        .from('products')
        .update({
          price: currentPrice,
          original_price: originalPrice,
        })
        .eq('id', product.id);

      if (!updateError) {
        updatedProducts.push({
          id: product.id,
          slug: product.slug,
          old_price: product.price,
          new_price: currentPrice
        });
      }
    }

    // 5. Trigger on-demand cache revalidation webhook in Next.js CDN
    const revalidateToken = Deno.env.get('REVALIDATE_TOKEN');
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? "http://localhost:3000";
    
    await fetch(`${appUrl}/api/revalidate?secret=${revalidateToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['products'] })
    }).catch(() => {/* Local fallback or silent fail */});

    return new Response(JSON.stringify({
      message: "Affiliate prices synchronized successfully",
      count: updatedProducts.length,
      updates: updatedProducts
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
})
