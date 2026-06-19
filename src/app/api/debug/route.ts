import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let cfEnv: Record<string, string> = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequestContext } = require("@cloudflare/next-on-pages");
    const ctx = getRequestContext();
    const env = ctx?.env as Record<string, string> | undefined;
    if (env) {
      cfEnv = {
        NEXT_PUBLIC_SUPABASE_URL: env["NEXT_PUBLIC_SUPABASE_URL"] ? "present" : "missing",
        SUPABASE_SERVICE_ROLE_KEY: env["SUPABASE_SERVICE_ROLE_KEY"] ? "present" : "missing",
      };
    }
  } catch (e) {
    cfEnv = { error: String(e) };
  }

  const envStatus = {
    "process.env.URL": url ? url.substring(0, 30) + "..." : "MISSING",
    "process.env.KEY": key ? key.substring(0, 10) + "..." : "MISSING",
    "cloudflare.env": cfEnv,
  };

  let queryResult: unknown = null;
  let queryError: unknown = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("patients")
      .select("id")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .limit(1);
    queryResult = data;
    queryError = error;
  } catch (e: unknown) {
    queryError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({ envStatus, queryResult, queryError });
}
