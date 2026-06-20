import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("controls")
    .select("*, patients(id, full_name, phone)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .neq("status", "cancelled")
    .order("due_date", { ascending: true, nullsFirst: false });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.patient_id || !body.title) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("controls")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      patient_id: body.patient_id,
      title: body.title,
      due_date: body.due_date || null,
      status: "pending",
      notes: body.notes || null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
