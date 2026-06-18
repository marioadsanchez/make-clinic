import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("name");

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("procedures")
    .insert({
      clinic_id: DEMO_CLINIC_ID,
      name: body.name,
      description: body.description || null,
      base_price: body.base_price ? parseFloat(body.base_price) : null,
      estimated_duration_minutes: body.estimated_duration_minutes ? parseInt(body.estimated_duration_minutes) : null,
      is_surgical: body.is_surgical === true || body.is_surgical === "true",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
