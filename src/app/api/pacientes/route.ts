import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      name: body.name,
      document: body.document || null,
      birth_date: body.birth_date || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      address: body.address || null,
      notes: body.notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
