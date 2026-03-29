import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://egwomdsbolseyjjwogeh.supabase.co";
const supabaseAnonKey = "sb_publishable_7Sp3-JOaFl0sWF2p-SnfaQ_VFf0qf8I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);