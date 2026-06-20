import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("proposals").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const totalPrice = body.total_price ? parseFloat(body.total_price) : null;
  const discount = body.discount ? parseFloat(body.discount) : 0;
  const finalPrice = totalPrice !== null ? totalPrice - (discount ?? 0) : null;

  const { error } = await supabase
    .from("proposals")
    .update({
      title: body.title,
      body: body.body,
      total_price: totalPrice,
      discount: discount,
      final_price: finalPrice,
      valid_until: body.valid_until || null,
      payment_notes: body.payment_notes || null,
      notes: body.notes || null,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
