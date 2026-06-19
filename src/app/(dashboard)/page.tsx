import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users, Calendar, FileText, AlertCircle } from "lucide-react";

export const runtime = "edge";

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [
    { count: totalPatients },
    { data: todayAppointments },
    { count: pendingProposals },
    { count: pendingControls },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", DEMO_CLINIC_ID).eq("active", true),
    supabase.from("appointments")
      .select("id, title, starts_at, ends_at, status, patients(id, full_name, phone)")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString())
      .not("status", "in", "(cancelled,no_show)")
      .order("starts_at"),
    supabase.from("proposals").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .in("status", ["draft", "sent", "viewed"]),
    supabase.from("controls").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .eq("status", "pending"),
  ]);

  const cards = [
    { label: "Pacientes", value: totalPatients ?? 0, icon: Users, href: "/pacientes", color: "blue" },
    { label: "Consultas Hoy", value: todayAppointments?.length ?? 0, icon: Calendar, href: "/agenda", color: "green" },
    { label: "Propuestas Pendientes", value: pendingProposals ?? 0, icon: FileText, href: "/propuestas", color: "yellow" },
    { label: "Controles Pendientes", value: pendingControls ?? 0, icon: AlertCircle, href: "/pacientes", color: "red" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 capitalize">
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[card.color]}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Consultas de Hoy</h2>
            <Link href="/agenda/nueva" className="text-sm font-medium text-blue-600 hover:text-blue-700">+ Nueva</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {!todayAppointments?.length ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">Ninguna consulta programada.</p>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{formatTime(apt.starts_at)}</p>
                    <p className="text-xs text-gray-500">{formatTime(apt.ends_at)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {(apt.patients as { full_name: string } | null)?.full_name ?? "—"}
                    </p>
                    <p className="truncate text-xs text-gray-500">{apt.title}</p>
                  </div>
                  <span className={`text-xs font-medium ${apt.status === "confirmed" ? "text-green-600" : "text-gray-400"}`}>
                    {apt.status === "confirmed" ? "Confirmada" : "Pendiente"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Accesos Rápidos</h2>
          <div className="space-y-2">
            <Link href="/pacientes/nuevo" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Nuevo Paciente</span>
            </Link>
            <Link href="/agenda/nueva" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Nueva Consulta</span>
            </Link>
            <Link href="/propuestas/nueva" className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Nueva Propuesta</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
