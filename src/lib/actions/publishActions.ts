"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import DOMPurify from 'isomorphic-dompurify';
import { z } from "zod";

const locale = "en";

// Industrial-grade HTML sanitizer using isomorphic-dompurify
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

// Simple robust slug generator
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Validation Schemas
const articleSchema = z.object({
  pillar: z.enum(["home", "money", "pet", "senior", "travel"], { message: "A valid pillar is required." }),
  title: z.string().min(1, "Title is required.").max(200, "Title is too long."),
  description: z.string().max(500, "Description is too long.").optional().nullable(),
  content: z.string().min(1, "Article content cannot be empty."),
  imageUrl: z.string().url("Invalid image URL.").optional().nullable().or(z.literal('')),
  sourceUrl: z.string().url("Invalid source URL.").optional().nullable().or(z.literal('')),
  sponsorId: z.string().uuid("Invalid Sponsor ID.").optional().nullable(),
});

const reviewSchema = z.object({
  articleId: z.string().uuid("Invalid Article ID."),
  status: z.enum(["approved", "rejected"], { message: "Invalid status." }),
  reviewerNotes: z.string().max(1000).optional().nullable(),
});

// 1. Multi-Author Article Submission Action
export async function submitArticleAction(payload: any) {
  const parsed = articleSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { pillar, title, description, content, imageUrl, sourceUrl, sponsorId } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to submit an article." };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return { success: false, error: "Failed to verify user permissions." };
  }

  // Map author category
  let authorType = "user";
  if (userData.role === "admin") authorType = "admin";
  else if (userData.role === "expert") authorType = "expert";

  const baseSlug = generateSlug(title);
  const uniqueId = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug}-${uniqueId}`;

  // TipTap HTML Sanitation
  const sanitizedContent = sanitizeHtml(content);

  const initialStatus = userData.role === "admin" ? "approved" : "pending_review";
  const isActive = userData.role === "admin"; 

  const { error } = await supabase.from("articles").insert({
    slug,
    pillar,
    title: title.trim(),
    description: description ? description.trim() : null,
    content: sanitizedContent,
    image_url: imageUrl || null,
    source_url: sourceUrl || null,
    author: userData.display_name || user.email?.split("@")[0] || "Contributor",
    author_id: user.id,
    author_type: authorType as any,
    sponsor_id: sponsorId || null,
    status: initialStatus as any,
    is_active: isActive
  });

  if (error) {
    console.error("Failed to insert multi-author article:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/article/[slug]", "page");
  return { success: true, slug, status: initialStatus };
}

// 2. Admin Review Article Action
export async function reviewArticleAction(payload: any) {
  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { articleId, status, reviewerNotes } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in as administrator." };
  }

  const { data: isUserAdmin } = await supabase.rpc("is_admin");
  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const isActive = status === "approved";

  const { error } = await adminClient.from("articles").update({
      status: status as any,
      is_active: isActive,
      reviewer_notes: reviewerNotes || null
    })
    .eq("id", articleId);

  if (error) {
    console.error("Failed to review article:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]", "layout");
  return { success: true };
}
