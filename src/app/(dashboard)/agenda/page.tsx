import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

const statusConfig: Record<string, { label: string; variant: "gray" | "blue" | "green" | "yellow" | "red" }> = {
  scheduled:   { label: "Programada",    variant: "gray" },
  confirmed:   { label: "Confirmada",    variant: "green" },
  in_progress: { label: "En curso",      variant: "blue" },
  completed:   { label: "Completada",    variant: "green" },
  cancelled:   { label: "Cancelada",     variant: "red" },
  no_show:     { label: "No asistió",    variant: "red" },
};

const typeLabels: Record<string, string> = {
  consultation: "Consulta",
  follow_up:    "Seguimiento",
  surgery:      "Cirugía",
  procedure:    "Procedimiento",
  evaluation:   "Evaluación",
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function toParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const supabase = createAdminClient();

  const targetDate = fecha ? new Date(fecha + "T12:00:00") : new Date();
  const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);   end.setHours(23, 59, 59, 999);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, title, type, status, starts_at, ends_at, notes, patients(id, full_name, phone)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .gte("starts_at", start.toISOString())
    .lte("starts_at", end.toISOString())
    .order("starts_at");

  const dateLabel = targetDate.toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const prev = new Date(targetDate); prev.setDate(prev.getDate() - 1);
  const next = new Date(targetDate); next.setDate(next.getDate() + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151c27]">Agenda</h1>
          <p className="text-sm text-[#797588] capitalize">{dateLabel}</p>
        </div>
        <Link href="/agenda/nueva" className="btn-primary">
          + Nueva Consulta
        </Link>
      </div>

      <div className="card flex items-center justify-between px-4 py-3">
        <Link href={`/agenda?fecha=${toParam(prev)}`}
          className="rounded-lg px-3 py-1.5 text-sm text-[#484556] hover:bg-[#f9f9ff]">
          ← Anterior
        </Link>
        <Link href="/agenda" className="text-sm font-medium text-[#5427e6] hover:text-[#4500d8]">
          Hoy
        </Link>
        <Link href={`/agenda?fecha=${toParam(next)}`}
          className="rounded-lg px-3 py-1.5 text-sm text-[#484556] hover:bg-[#f9f9ff]">
          Siguiente →
        </Link>
      </div>

      <div className="card">
        {!appointments?.length ? (
          <EmptyState
            icon={Calendar}
            title="Sin consultas"
            description="No hay consultas programadas para este día."
            action={
              <Link href="/agenda/nueva" className="btn-primary">
                + Nueva Consulta
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-[#f0f3ff]">
            {appointments.map((apt) => {
              const patient = apt.patients as { id: string; full_name: string; phone: string | null } | null;
              const s = statusConfig[apt.status] ?? { label: apt.status, variant: "gray" as const };
              return (
                <div key={apt.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#151c27]">{formatTime(apt.starts_at)}</p>
                    <p className="text-xs text-[#797588]">{formatTime(apt.ends_at)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[#151c27]">{apt.title}</p>
                      <Badge label={s.label} variant={s.variant} />
                      {apt.type && apt.type !== "consultation" && (
                        <span className="text-xs text-[#797588]">{typeLabels[apt.type] ?? apt.type}</span>
                      )}
                    </div>
                    {patient && (
                      <Link href={`/pacientes/${patient.id}`}
                        className="mt-1 block text-sm text-[#5427e6] hover:underline">
                        {patient.full_name}{patient.phone ? ` · ${patient.phone}` : ""}
                      </Link>
                    )}
                    {apt.notes && <p className="mt-1 text-sm text-[#797588]">{apt.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
