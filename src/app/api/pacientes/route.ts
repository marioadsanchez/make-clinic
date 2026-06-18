import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const split = (val: string | undefined) =>
    val ? val.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  const patient = {
    clinic_id: DEMO_CLINIC_ID,
    full_name: body.full_name,
    birth_date: body.birth_date || null,
    sex: body.sex || null,
    blood_type: body.blood_type || "unknown",
    phone: body.phone || null,
    email: body.email || null,
    emergency_contact_name: body.emergency_contact_name || null,
    emergency_contact_phone: body.emergency_contact_phone || null,
    city: body.city || null,
    state: body.state || null,
    country: body.country || "MX",
    allergies: split(body.allergies_text),
    chronic_conditions: split(body.chronic_conditions_text),
    current_medications: split(body.current_medications_text),
    previous_surgeries: split(body.previous_surgeries_text),
    referral_source: body.referral_source || null,
    notes: body.notes || null,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .insert(patient)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
