import { createClient } from "@supabase/supabase-js";
import config from "../config";

const supabase = createClient(
  config.supabase_bucket_url,
  config.supabase_bucket_key
);

export default supabase;
