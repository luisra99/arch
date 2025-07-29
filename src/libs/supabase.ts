import { env } from "../config/env";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;
