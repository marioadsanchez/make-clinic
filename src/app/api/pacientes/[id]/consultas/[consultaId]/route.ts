import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string; consultaId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { consultaId } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", consultaId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { consultaId } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("consultations")
    .update({
      date: body.date || undefined,
      chief_complaint: body.chief_complaint || null,
      history: body.history || null,
      physical_exam: body.physical_exam || null,
      diagnosis: body.diagnosis || null,
      treatment_plan: body.treatment_plan || null,
      notes: body.notes || null,
    })
    .eq("id", consultaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
