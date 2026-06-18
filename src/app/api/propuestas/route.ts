import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.patient_id || !body.title || !body.body) {
    return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: body.patient_id,
      doctor_id: DEMO_CLINIC_ID,
      title: body.title,
      body: body.body,
      price: body.price ? parseFloat(body.price) : null,
      status: "draft",
      payment_status: "pending",
      expires_at: body.expires_at || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
