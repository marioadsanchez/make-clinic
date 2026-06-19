import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

  const envStatus = {
    URL: url ? url.substring(0, 30) + "..." : "MISSING",
    SERVICE_KEY: key ? key.substring(0, 10) + "..." : "MISSING",
  };

  let queryResult: unknown = null;
  let queryError: unknown = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("patients")
      .select("id, name")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .limit(2);
    queryResult = data;
    queryError = error;
  } catch (e: unknown) {
    queryError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({ envStatus, queryResult, queryError });
}
