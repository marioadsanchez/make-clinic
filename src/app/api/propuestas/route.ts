import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.patient_id || !body.title || !body.body) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const totalPrice = body.price ? parseFloat(body.price) : null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: body.patient_id,
      title: body.title,
      body: body.body,
      total_price: totalPrice,
      final_price: totalPrice,
      status: "draft",
      payment_status: "pending",
      valid_until: body.expires_at || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
