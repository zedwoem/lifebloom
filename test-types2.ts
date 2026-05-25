import type { Database } from "./src/lib/supabase/types";

type Tables = keyof Database["public"]["Tables"];
// Let's create a variable of this type and see what TSC says
const t: Tables = "expert_profiles";
