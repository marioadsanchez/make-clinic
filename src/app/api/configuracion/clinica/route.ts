import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("name, email, phone, address")
    .eq("id", DEMO_CLINIC_ID)
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("clinics")
    .update({
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
    })
    .eq("id", DEMO_CLINIC_ID);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
