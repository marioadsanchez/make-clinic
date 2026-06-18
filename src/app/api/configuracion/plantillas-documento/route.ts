import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("document_templates")
    .select("id, name, body")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("name");

  return NextResponse.json(data ?? []);
}
