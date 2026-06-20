import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.patient_id || !body.title) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: body.patient_id,
      title: body.title,
      body: body.body || "",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
