import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req, connInfo) => {
  const url = new URL(req.url);
  const vendor = url.searchParams.get("vendor");
  const productId = url.searchParams.get("product_id");
  const userId = url.searchParams.get("user_id");

  if (!vendor || !productId) {
    return new Response(JSON.stringify({ error: "Missing vendor or product_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rewrite logic based on vendor
  let targetUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://lifebloomhub.vercel.app"; // default fallback

  if (vendor === "amazon") {
    const affiliateTag = Deno.env.get("AFFILIATE_AMAZON_PARTNER_TAG") || "lifebloom-20";
    targetUrl = `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;
  } else if (vendor === "chewy") {
    targetUrl = `https://www.chewy.com/dp/${productId}?aff=lifebloom`;
  } else if (vendor === "travelpayouts") {
    targetUrl = `https://search.jetradar.com/flights/${productId}?marker=lifebloom`;
  } else if (vendor === "b2b") {
    try {
      const { data: placement, error } = await supabase
        .from("b2b_placements")
        .select("target_url, partner_name")
        .eq("id", productId)
        .maybeSingle();
      
      if (!error && placement) {
        targetUrl = placement.target_url;
        
        // Audit log B2B click in activity_logs for RPM calculating
        if (userId) {
          await supabase.from("activity_logs").insert({
            user_id: userId,
            action_type: `b2b_click_${placement.partner_name.toLowerCase().replace(/\s+/g, '_')}`,
            points_awarded: 5
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch B2B placement URL:", e);
    }
  }

  // Non-blocking award points
  if (userId) {
    const awardPointsTask = async () => {
      try {
        const { error } = await supabase.rpc("award_points_secure", {
          user_id_param: userId,
          amount: 15, // +15 Bloom Points
        });
        if (error) {
          console.error("Failed to award points:", error);
        } else {
          console.log(`Awarded 15 points to user ${userId}`);
        }
      } catch (e) {
        console.error("RPC execution failed:", e);
      }
    };

    // Use Edge Runtime's WaitUntil to keep execution alive without blocking the response
    if (typeof (req as any).waitUntil === "function") {
      (req as any).waitUntil(awardPointsTask());
    } else {
      // Deno specific edge context workaround or fire & forget
      awardPointsTask().catch(console.error);
    }
  }

  // 307 Temporary Redirect with Referrer-Policy
  return new Response(null, {
    status: 307,
    headers: {
      "Location": targetUrl,
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});
