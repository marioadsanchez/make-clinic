import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("patient_id", id)
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("consultations")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: id,
      date: body.date || new Date().toISOString(),
      chief_complaint: body.chief_complaint || null,
      history: body.history || null,
      physical_exam: body.physical_exam || null,
      diagnosis: body.diagnosis || null,
      treatment_plan: body.treatment_plan || null,
      notes: body.notes || null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
