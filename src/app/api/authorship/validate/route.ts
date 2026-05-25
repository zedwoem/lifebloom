import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { wikidataId, userId } = await request.json();

    if (!wikidataId || !userId) {
      return NextResponse.json({ error: "Missing wikidataId or userId" }, { status: 400 });
    }

    // Call OpenAlex API
    const response = await fetch(`https://api.openalex.org/authors/https://www.wikidata.org/entity/${wikidataId}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch OpenAlex data" }, { status: response.status });
    }

    const data = await response.json();

    // Extract relevant data
    const hIndex = data.summary_stats?.h_index || 0;
    const citationCount = data.summary_stats?.cited_by_count || 0;
    const orcidId = data.orcid ? data.orcid.replace("https://orcid.org/", "") : null;

    // Update Supabase
    const { error: updateError } = await supabase
      .from("expert_profiles")
      .update({
        h_index: hIndex,
        citation_count: citationCount,
        ...(orcidId && { orcid_id: orcidId }),
        last_verified_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile in database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      h_index: hIndex,
      citation_count: citationCount,
      orcid_id: orcidId
    });

  } catch (error) {
    console.error("Authorship validation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
