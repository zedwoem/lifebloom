"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// 1. List all users (Admin only)
export async function listAllUsers() {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list users:", error);
    return { success: false, error: error.message };
  }

  return { success: true, users: data };
}

// 2. Update User Role (Admin only)
export async function updateUserRole({ userId, newRole }: { userId: string; newRole: string }) {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/admin/users", "page");
  return { success: true };
}

// 3. Toggle User Active Status (Ban / Unban) (Admin only)
export async function toggleUserActiveStatus({ userId, isActive }: { userId: string; isActive: boolean }) {
  const supabase = await createClient();
  const { data: isUserAdmin } = await supabase.rpc("is_admin");

  if (!isUserAdmin) {
    return { success: false, error: "Access denied. Admin role required." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    console.error("Failed to toggle user status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/admin/users", "page");
  return { success: true };
}

// 4. Submit Answer for Q&A (Expert / Admin only)
export async function submitQuestionAnswer({ questionId, answerContent }: { questionId: string; answerContent: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  // Get current user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAllowed = userData?.role === "admin" || userData?.role === "expert";
  if (!isAllowed) {
    return { success: false, error: "Access denied. Expert or Admin role required." };
  }

  const { error } = await supabase
    .from("questions")
    .update({
      answer_content: answerContent,
      answered_at: new Date().toISOString(),
      expert_id: user.id,
      status: "answered"
    })
    .eq("id", questionId);

  if (error) {
    console.error("Failed to answer question:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/[locale]/dashboard", "page");
  return { success: true };
}
