"use server";

import { createClient, createPoolClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import DOMPurify from 'isomorphic-dompurify';
import { z } from "zod";
import { Redis } from '@upstash/redis';

const locale = "en";

// Ensure this file executes on default Node.js runtime for TCP access

// Rate Limit helper using Upstash Redis
async function rateLimit(key: string, limit: number, durationSeconds: number): Promise<{ success: boolean; remaining: number }> {
  try {
    const redis = Redis.fromEnv();
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, durationSeconds);
    }
    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current)
    };
  } catch (e) {
    console.error("[Redis Rate Limit Error]:", e);
    // Graceful fallback: allow action if Redis fails to not break UX
    return { success: true, remaining: 1 };
  }
}

// Rich HTML sanitizer for articles (if ever needed in backend)
function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'class', 'style', 'width', 'height'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'applet'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

// Strict plain-text sanitizer for user comments to prevent XSS
function sanitizeComment(text: string): string {
  if (!text) return "";
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// Validation Schemas
const commentSchema = z.object({
  articleId: z.string().uuid("Invalid Article ID."),
  parentId: z.string().uuid("Invalid Parent ID.").nullable().optional(),
  name: z.string().min(1, "Name is required.").max(100, "Name is too long."),
  email: z.string().email("A valid email is required.").optional().or(z.literal('')),
  content: z.string().min(1, "Comment cannot be empty.").max(2000, "Comment exceeds maximum length."),
});

const guestbookSchema = z.object({
  content: z.string().min(1, "Message cannot be empty.").max(500, "Message exceeds maximum length."),
});

const contactSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Valid email is required."),
  companyName: z.string().max(150).optional(),
  category: z.enum(["general", "expert_join", "sponsor_inquiry"], { message: "Invalid category." }),
  message: z.string().min(1, "Message is required.").max(5000, "Message is too long."),
});

// 1. Threaded Comments Submission Action
export async function submitCommentAction(payload: any) {
  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { articleId, parentId, name, email, content } = parsed.data;
  const sanitizedContent = sanitizeComment(content);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Enforce Redis Rate Limiting
  if (user) {
    // Authenticated user limit: max 10 comments per hour
    const limitKey = `rate:comment:user:${user.id}`;
    const { success } = await rateLimit(limitKey, 10, 3600);
    if (!success) {
      return { success: false, error: "Batas pengiriman terlampaui. Anda hanya bisa mengirim 10 komentar per jam." };
    }
  } else {
    // Guest limit: max 3 comments per email per 5 minutes
    const guestEmail = email ? email.trim().toLowerCase() : "anonymous";
    const limitKey = `rate:comment:guest:${guestEmail}`;
    const { success } = await rateLimit(limitKey, 3, 300);
    if (!success) {
      return { success: false, error: "Batas pengiriman terlampaui. Tamu hanya bisa mengirim 3 komentar per 5 menit." };
    }
  }

  // Try direct Supavisor TCP Pooler on port 6543
  const sql = createPoolClient();
  if (sql) {
    try {
      await sql`
        INSERT INTO public.comments (
          article_id, parent_id, user_id, author_name, author_email, content, is_approved
        ) VALUES (
          ${articleId}, 
          ${parentId || null}, 
          ${user?.id || null}, 
          ${name.trim()}, 
          ${email ? email.trim() : null}, 
          ${sanitizedContent.trim()}, 
          false
        )
      `;
      revalidatePath("/[locale]/article/[slug]", "layout");
      return { success: true };
    } catch (poolError: any) {
      console.warn("[SUPABASE POOLER] submitCommentAction failed, falling back to HTTP REST API:", poolError.message);
    }
  }

  // REST API Fallback
  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    parent_id: parentId || null,
    user_id: user?.id || null,
    author_name: name.trim(),
    author_email: email ? email.trim() : null,
    content: sanitizedContent.trim(),
    is_approved: false,
  });

  if (error) {
    console.error("REST comment insert failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/article/[slug]", "layout");
  return { success: true };
}

// 2. Realtime Guestbook Submission Action
export async function submitGuestbookAction(payload: any) {
  const parsed = guestbookSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { content } = parsed.data;
  const sanitizedContent = sanitizeHtml(content);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to sign the guestbook." };
  }

  // 60 seconds rate limiting using Redis
  const limitKey = `rate:guestbook:${user.id}`;
  const { success: allowed } = await rateLimit(limitKey, 1, 60);
  if (!allowed) {
    return { success: false, error: "Tunggu 60 detik sebelum mengirim pesan dukungan lainnya." };
  }

  // Fetch display_name
  const { data: userData } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const authorName = userData?.display_name || user.email?.split("@")[0] || "Anonymous";

  // Try direct Supavisor TCP Pooler on port 6543
  const sql = createPoolClient();
  if (sql) {
    try {
      await sql`
        INSERT INTO public.guestbook (
          user_id, author_name, content
        ) VALUES (
          ${user.id}, 
          ${authorName}, 
          ${sanitizedContent.trim()}
        )
      `;
      revalidatePath("/[locale]/saved", "page");
      return { success: true };
    } catch (poolError: any) {
      console.warn("[SUPABASE POOLER] submitGuestbookAction failed, falling back to HTTP REST API:", poolError.message);
    }
  }

  // REST API Fallback
  const { error } = await supabase.from("guestbook").insert({
    user_id: user.id,
    author_name: authorName,
    content: sanitizedContent.trim(),
  });

  if (error) {
    console.error("REST guestbook insert failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/saved", "page");
  return { success: true };
}

// 3. Contact & Partner Ingest Action
export async function submitContactAction(payload: any) {
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, companyName, category, message } = parsed.data;
  const sanitizedMessage = sanitizeHtml(message);

  const supabase = await createClient();

  // Try direct Supavisor TCP Pooler on port 6543
  const sql = createPoolClient();
  if (sql) {
    try {
      await sql`
        INSERT INTO public.contact_submissions (
          name, email, company_name, category, message, is_reviewed
        ) VALUES (
          ${name.trim()}, 
          ${email.trim()}, 
          ${companyName ? companyName.trim() : null}, 
          ${category}, 
          ${sanitizedMessage.trim()}, 
          false
        )
      `;
      return { success: true };
    } catch (poolError: any) {
      console.warn("[SUPABASE POOLER] submitContactAction failed, falling back to HTTP REST API:", poolError.message);
    }
  }

  // REST API Fallback
  const { error } = await supabase.from("contact_submissions").insert({
    name: name.trim(),
    email: email.trim(),
    company_name: companyName ? companyName.trim() : null,
    category,
    message: sanitizedMessage.trim(),
    is_reviewed: false
  });

  if (error) {
    console.error("REST contact_submissions insert failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 4. Comment Moderation Server Action
export async function moderateCommentAction({ commentId, status }: { commentId: string; status: "approve" | "delete" }) {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  if (status === "approve") {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: true })
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

