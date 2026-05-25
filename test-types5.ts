import { Database } from "./src/lib/supabase/types";

// This checks if Database['public'] extends GenericSchema
const test: Database['public']['Tables']['expert_profiles'] = {} as any;
type IsGenericSchema = Database['public'] extends Record<string, unknown> ? true : false;
// Actually I need to import GenericSchema from postgrest-js
