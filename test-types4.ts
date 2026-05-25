import { Database } from "./src/lib/supabase/types";

type UpdateType = Database['public']['Tables']['expert_profiles']['Update'];
const a: UpdateType = { h_index: 1 };
