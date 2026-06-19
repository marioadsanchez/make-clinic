import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: patient }, { data: medical_record }] = await Promise.all([
    supabase.from("patients").select("full_name, allergies, chronic_conditions, current_medications").eq("id", id).single(),
    supabase.from("medical_records").select("*").eq("patient_id", id).maybeSingle(),
  ]);

  return NextResponse.json({ patient, medical_record });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  // Update patient arrays
  const { error: patientError } = await supabase
    .from("patients")
    .update({
      allergies: body.allergies ?? [],
      chronic_conditions: body.chronic_conditions ?? [],
      current_medications: body.current_medications ?? [],
    })
    .eq("id", id);

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 500 });
  }

  // Upsert medical record
  const { error: mrError } = await supabase
    .from("medical_records")
    .upsert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: id,
      family_history: body.family_history,
      personal_history: body.personal_history,
      surgical_history: body.surgical_history,
      gynecological_history: body.gynecological_history,
      habits: body.habits,
      aesthetic_complaints: body.aesthetic_complaints,
      aesthetic_notes: body.aesthetic_notes,
    }, { onConflict: "patient_id" });

  if (mrError) {
    return NextResponse.json({ error: mrError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
