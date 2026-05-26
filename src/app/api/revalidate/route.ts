import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const token = process.env.REVALIDATE_TOKEN || "lifebloom-revalidate-secret";

    if (secret !== token) {
      return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { path, tag, tags } = body;

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach(t => revalidateTag(t));
      return NextResponse.json({ revalidated: true, tags });
    }

    // Default: Revalidate entire page tree
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, message: "Revalidated all layouts and pages" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support simple GET calls for testing or direct revalidation
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const token = process.env.REVALIDATE_TOKEN || "lifebloom-revalidate-secret";

    if (secret !== token) {
      return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
    }

    const path = searchParams.get("path");
    const tag = searchParams.get("tag");

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, message: "Revalidated all layouts and pages" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
