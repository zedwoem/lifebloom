import { createAdminClient } from "./src/lib/supabase/admin";
const supabase = createAdminClient();
type FromType = ReturnType<typeof supabase.from>;
// let's see what happens if I force an error
const check: FromType = 123;
