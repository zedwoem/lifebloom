import { createAdminClient } from "./src/lib/supabase/admin";

const supabase = createAdminClient();
const query = supabase.from("expert_profiles").update({ h_index: 10 });
