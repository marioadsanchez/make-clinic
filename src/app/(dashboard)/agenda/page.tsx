import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { AgendaView } from "./agenda-view";

export const runtime = "edge";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const supabase = createAdminClient();

  const targetDate = fecha ? new Date(fecha + "T12:00:00") : new Date();
  const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate); end.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, title, type, status, starts_at, ends_at, notes, patients(id, full_name, phone)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .gte("starts_at", start.toISOString())
    .lte("starts_at", end.toISOString())
    .order("starts_at");

  const dateParam = fecha ?? targetDate.toISOString().slice(0, 10);

  return (
    <AgendaView
      appointments={(appointments ?? []) as Parameters<typeof AgendaView>[0]["appointments"]}
      dateParam={dateParam}
    />
  );
}
