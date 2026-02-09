import { createClient } from "npm:@supabase/supabase-js";

// This is a replacement for kv_store.tsx to avoid JSR imports which are causing 403 errors
const client = () => createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_cdc57b20").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_cdc57b20").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};
