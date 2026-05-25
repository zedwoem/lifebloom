// supabase/functions/award-points/index.ts
// Supabase Edge Function — Secure Points Awarding Endpoint (Deno Runtime)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

serve(async (req) => {
  // Handle CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST'
      }
    });
  }

  try {
    // 1. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? "";
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Parse request parameters
    const { user_id, points, action_type } = await req.json();

    if (!user_id || !points || !action_type) {
      return new Response(JSON.stringify({ error: "Missing parameters: user_id, points, or action_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Call secure postgres RPC
    const { data: newTotal, error: rpcError } = await supabase.rpc('award_points_secure', {
      p_user_id: user_id,
      p_points: Number(points),
      p_action_type: action_type
    });

    if (rpcError) {
      throw rpcError;
    }

    return new Response(JSON.stringify({
      message: "Bloom Points awarded successfully",
      user_id,
      points_awarded: Number(points),
      bloom_points_total: newTotal
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });
  }
})
