import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("id, title, body, total_price, discount, final_price, valid_until, status, payment_notes, patients(full_name)")
    .eq("public_token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark as viewed if it was sent
  if (data.status === "sent") {
    await supabase
      .from("proposals")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("public_token", token);
  }

  return NextResponse.json(data);
}
