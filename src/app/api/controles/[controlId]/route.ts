import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

type Ctx = { params: Promise<{ controlId: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { controlId } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.notes !== undefined) update.notes = body.notes || null;
  if (body.due_date !== undefined) update.due_date = body.due_date || null;
  if (body.status === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("controls").update(update).eq("id", controlId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
