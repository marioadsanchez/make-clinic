import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // NEXT_PUBLIC_ prefix required so the value is inlined at build time for Cloudflare Edge Runtime
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}
