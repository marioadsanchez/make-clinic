import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

const statusLabel: Record<string, { label: string; variant: "gray" | "blue" | "green" | "yellow" | "red" }> = {
  scheduled: { label: "Programada", variant: "gray" },
  confirmed: { label: "Confirmada", variant: "green" },
  in_progress: { label: "En curso", variant: "blue" },
  completed: { label: "Completada", variant: "green" },
  cancelled: { label: "Cancelada", variant: "red" },
  no_show: { label: "No asistió", variant: "red" },
};

const typeLabel: Record<string, string> = {
  consultation: "Consulta",
  follow_up: "Seguimiento",
  surgery: "Cirugía",
  procedure: "Procedimiento",
  evaluation: "Evaluación",
};

function formatDateTime(dt: string) {
  const d = new Date(dt);
  return {
    date: d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const supabase = createAdminClient();

  const targetDate = fecha ? new Date(fecha) : new Date();
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

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

  const prev = new Date(targetDate);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(targetDate);
  next.setDate(next.getDate() + 1);

  const toParam = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 capitalize">{dateLabel}</p>
        </div>
        <Link
          href="/agenda/nueva"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva Consulta
        </Link>
      </div>

      {/* Navegación de fechas */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
        <Link href={`/agenda?fecha=${toParam(prev)}`} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          ← Anterior
        </Link>
        <Link href="/agenda" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Hoy
        </Link>
        <Link href={`/agenda?fecha=${toParam(next)}`} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Siguiente →
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {!appointments?.length ? (
          <EmptyState
            icon={Calendar}
            title="Sin consultas"
            description="No hay consultas programadas para este día."
            action={
              <Link
                href="/agenda/nueva"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Nueva Consulta
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => {
              const start = formatDateTime(apt.starts_at);
              const end = formatDateTime(apt.ends_at);
              const statusInfo = statusLabel[apt.status] ?? { label: apt.status, variant: "gray" as const };
              const patient = apt.patients as { id: string; full_name: string; phone: string | null } | null;
              return (
                <div key={apt.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">{start.time}</p>
                    <p className="text-xs text-gray-400">{end.time}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{apt.title}</p>
                      <Badge label={typeLabel[apt.type] ?? apt.type} variant="blue" />
                      <Badge label={statusInfo.label} variant={statusInfo.variant} />
                    </div>
                    {patient && (
                      <Link
                        href={`/pacientes/${patient.id}`}
                        className="mt-1 block text-sm text-blue-600 hover:underline"
                      >
                        {patient.full_name}
                        {patient.phone ? ` · ${patient.phone}` : ""}
                      </Link>
                    )}
                    {apt.notes && <p className="mt-1 text-sm text-gray-500">{apt.notes}</p>}
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
