import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const validStatus = ["sent", "viewed", "approved", "signed", "rejected", "expired"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(async () => {
    const text = await req.text();
    return Object.fromEntries(new URLSearchParams(text));
  });

  const status = body.status;
  if (!validStatus.includes(status)) {
    return NextResponse.json({ message: "Status inválido" }, { status: 400 });
  }

  const timestamps: Record<string, Record<string, string>> = {
    sent: { sent_at: new Date().toISOString() },
    approved: { approved_at: new Date().toISOString() },
    signed: { signed_at: new Date().toISOString() },
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status, ...timestamps[status] })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL(`/propuestas/${id}`, req.url));
}
