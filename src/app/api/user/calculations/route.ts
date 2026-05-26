import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    // Dijalankan secara asinkron tanpa memblokir respon ke pengguna
    const awardPointsPromise = (async () => {
      const { error } = await supabase.rpc("award_points_secure", {
        user_id_param: user.id,
        amount: 15
      });
      if (error) {
        console.error("[Calculations Gamification Error]:", error.message);
      }
    })();

    if (typeof (req as any).waitUntil === 'function') {
      (req as any).waitUntil(awardPointsPromise);
    } else {
      awardPointsPromise.catch(console.error);
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
