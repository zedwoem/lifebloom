import { NextResponse, after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/upstash";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { calculatorSlug, inputParams, outputResults } = data;

    // Simpan riwayat kalkulasi secara asinkron (Save calculation history)
    const { error: insertError } = await supabase
      .from('calculations_history')
      .insert({
        user_id: user.id,
        calculator_slug: calculatorSlug,
        input_params: inputParams,
        output_results: outputResults
      });

    if (insertError) {
      throw insertError;
    }

    // Pemicu Gamifikasi: awardPoints (+15 Bloom Points)
    // Terapkan perlindungan Race Condition: Maksimal 3 kali per hari per user.
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, "24 h"),
    });

    const { success: rateLimitSuccess } = await ratelimit.limit(`gamification_${user.id}_${calculatorSlug}`);

    if (rateLimitSuccess) {
      after(async () => {
        const { error } = await supabase.rpc("award_points_secure", {
          user_id_param: user.id,
          amount: 15
        });
        if (error) {
          console.error("[Calculations Gamification Error]:", error.message);
        }
      });
    } else {
      console.log(`[Gamification RateLimit] User ${user.id} reached daily cap for ${calculatorSlug}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Calculation saved and 15 Bloom Points awarded!'
    });

  } catch (error: any) {
    console.error("Calculations Save Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('calculations_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Calculations Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
