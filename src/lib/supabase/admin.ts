import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // In Cloudflare Pages Edge Runtime, env bindings are accessed via getRequestContext()
  if (!key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getRequestContext } = require("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as Record<string, string> | undefined;
      if (env) {
        url = url || env["NEXT_PUBLIC_SUPABASE_URL"];
        key = env["SUPABASE_SERVICE_ROLE_KEY"];
      }
    } catch {
      // not in Cloudflare context (e.g., local dev)
    }
  }

  return createClient(url!, key!);
}
