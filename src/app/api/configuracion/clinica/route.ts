import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

export async function PATCH(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { name, email, phone, address } = body;

  const { error } = await supabase
    .from("clinics")
    .update({ name, email, phone, address })
    .eq("id", DEMO_CLINIC_ID);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
