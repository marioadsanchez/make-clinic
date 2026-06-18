import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposal_templates")
    .select("id, name, body, created_at")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("name");

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.body) {
    return NextResponse.json({ message: "Nombre y contenido son obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("proposal_templates")
    .insert({ clinic_id: DEMO_CLINIC_ID, name: body.name, body: body.body })
    .select("id")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
