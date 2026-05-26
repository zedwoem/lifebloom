import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: savedItems, error } = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(savedItems);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { item_type, referenced_id, metadata } = await req.json();

    if (!item_type || !referenced_id) {
      return NextResponse.json({ error: "Missing item_type or referenced_id" }, { status: 400 });
    }

    // Insert or update bookmark
    const { data, error } = await supabase
      .from("saved_items")
      .upsert(
        {
          user_id: user.id,
          item_type,
          referenced_id,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_type,referenced_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Award user points for saving an item
    try {
      await supabase.rpc("award_points_secure", {
        user_id_param: user.id,
        amount: 10,
      });
    } catch (pointsErr) {
      console.error("Failed to award points:", pointsErr);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const referenced_id = searchParams.get("referenced_id");

    if (!referenced_id) {
      return NextResponse.json({ error: "Missing referenced_id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("referenced_id", referenced_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
