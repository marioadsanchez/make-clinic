import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.patient_id || !body.title || !body.start_at || !body.end_at) {
    return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: body.patient_id,
      title: body.title,
      status: "scheduled",
      start_at: body.start_at,
      end_at: body.end_at,
      notes: body.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
