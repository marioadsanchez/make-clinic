import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.full_name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      full_name: body.full_name,
      birth_date: body.birth_date || null,
      sex: body.sex || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || null,
      referral_source: body.referral_source || null,
      notes: body.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
