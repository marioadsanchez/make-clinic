import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ id: string }> };

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();

  const token = randomToken();

  const { error } = await supabase
    .from("proposals")
    .update({ status: "sent", sent_at: new Date().toISOString(), public_token: token })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token });
}
