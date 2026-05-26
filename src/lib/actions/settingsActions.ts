"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getWebsiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("website_settings").select("*");
  if (error) {
    console.error("Failed to fetch website settings:", error);
    return [];
  }
  return data;
}

export async function updateWebsiteSetting(key: string, value: string) {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("website_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout"); // Revalidate all pages for global settings
  return { success: true };
}

export async function getSupportDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_documents")
    .select("slug, title, last_updated_at")
    .order("title");
    
  if (error) {
    console.error("Failed to fetch support documents:", error);
    return [];
  }
  return data;
}

export async function getSupportDocumentBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_documents")
    .select("*")
    .eq("slug", slug)
    .single();
    
  if (error) {
    return null;
  }
  return data;
}

export async function updateSupportDocument(slug: string, title: string, content: string) {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("support_documents")
    .update({ 
      title, 
      content, 
      last_updated_at: new Date().toISOString() 
    })
    .eq("slug", slug);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/[locale]/support/${slug}`, "page");
  return { success: true };
}
