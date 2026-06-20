import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const body = await req.json();

  if (!body.signer_name?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status")
    .eq("public_token", token)
    .single();

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (proposal.status === "signed") return NextResponse.json({ error: "Já assinado" }, { status: 409 });

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "signed",
      signed_at: new Date().toISOString(),
    })
    .eq("public_token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Store signature record
  await supabase.from("signatures").insert({
    proposal_id: proposal.id,
    signer_name: body.signer_name.trim(),
    signed_at: new Date().toISOString(),
    ip_address: ip,
    user_agent: ua,
  }).maybeSingle();

  return NextResponse.json({ ok: true });
}
