"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const supabase = createAdminClient();

export async function getPendingSponsors() {
  const { data, error } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch pending sponsors:", error);
    return [];
  }
  return data;
}

export async function approveSponsor(id: string) {
  const { error } = await supabase
    .from("expert_profiles")
    .update({ status: "approved" })
    .eq("id", id);

  if (error) {
    console.error("Failed to approve sponsor:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/[locale]/admin");
  return { success: true };
}

export async function rejectSponsor(id: string) {
  const { error } = await supabase
    .from("expert_profiles")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    console.error("Failed to reject sponsor:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/[locale]/admin");
  return { success: true };
}
