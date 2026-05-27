import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = (await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()) as any;

    if (!profile || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { job } = await req.json();

    if (!['rss-ingest', 'price-sync', 'youtube-ingest', 'translate-queue'].includes(job)) {
      return NextResponse.json({ error: "Invalid job name" }, { status: 400 });
    }

    // Panggil cron route internal Next.js (single unified pipeline, bukan Supabase Edge Function terpisah)
    // Ini memastikan job yang di-trigger manual identik dengan yang di-trigger Vercel Cron
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lifebloomhub.vercel.app";
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cron-Trigger] CRON_SECRET environment variable is not defined.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
    }

    // Map job name ke internal API route
    const jobRouteMap: Record<string, string> = {
      'rss-ingest': '/api/cron/rss-ingest',
      'youtube-ingest': '/api/cron/youtube-ingest',
      'price-sync': '/api/cron/price-sync',
      'translate-queue': '/api/cron/translate-queue',
    };

    const internalRoute = jobRouteMap[job];
    if (!internalRoute) {
      return NextResponse.json({ error: `No route mapped for job: ${job}` }, { status: 400 });
    }

    const response = await fetch(`${appUrl}${internalRoute}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
        "x-manual-trigger": "admin"
      }
    });

    const responseData = await response.json().catch(() => ({}));

    // Catat log dengan data riil dari response — tidak ada Math.random()
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    const processed = responseData.processed ?? responseData.count ?? 0;
    const duplicatesBlocked = responseData.duplicates_blocked ?? responseData.skipped ?? 0;

    await adminSupabase.from("system_cron_logs").insert({
      job_name: job,
      status: response.ok ? "success" : "failed",
      duplicates_blocked: duplicatesBlocked,
      items_processed: processed,
      details: responseData
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      job,
      responseData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
