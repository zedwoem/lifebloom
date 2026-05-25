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
  let targetUrl = "https://lifebloomhub.com"; // default fallback

  if (vendor === "amazon") {
    const affiliateTag = Deno.env.get("AFFILIATE_AMAZON_PARTNER_TAG") || "lifebloom-20";
    targetUrl = `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;
  } else if (vendor === "chewy") {
    targetUrl = `https://www.chewy.com/dp/${productId}?aff=lifebloom`;
  } else if (vendor === "travelpayouts") {
    targetUrl = `https://search.jetradar.com/flights/${productId}?marker=lifebloom`;
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
