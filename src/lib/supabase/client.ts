import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Missing Supabase environment configuration");
    }

    client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }

  return client;
}
