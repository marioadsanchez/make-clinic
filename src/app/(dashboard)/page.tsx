import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users, Calendar, FileText, ClipboardCheck, Plus, ArrowRight } from "lucide-react";

export const runtime = "edge";

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

const statusBadge: Record<string, string> = {
  scheduled:  "badge-blue",
  confirmed:  "badge-green",
  in_progress:"badge-purple",
  completed:  "badge-gray",
  cancelled:  "badge-red",
  no_show:    "badge-red",
};
const statusLabel: Record<string, string> = {
  scheduled: "Programada", confirmed: "Confirmada", in_progress: "En curso",
  completed: "Completada", cancelled: "Cancelada", no_show: "No asistió",
};

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [
    { count: totalPatients },
    { data: todayAppointments },
    { count: pendingProposals },
    { data: upcomingControls },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", DEMO_CLINIC_ID).eq("active", true),
    supabase.from("appointments")
      .select("id, title, type, starts_at, ends_at, status, patients(id, full_name)")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString())
      .not("status", "in", "(cancelled,no_show)")
      .order("starts_at"),
    supabase.from("proposals").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .in("status", ["draft", "sent", "viewed"]),
    supabase.from("controls")
      .select("id, title, due_date, patients(id, full_name)")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .eq("status", "pending")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(3),
  ]);

  const today_str = today.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { label: "Pacientes activos", value: totalPatients ?? 0, icon: Users,          color: "bg-[#f0f3ff] text-[#5427e6]", href: "/pacientes" },
    { label: "Citas hoy",         value: todayAppointments?.length ?? 0, icon: Calendar,       color: "bg-[#dcfce7] text-[#16a34a]", href: "/agenda" },
    { label: "Propuestas",        value: pendingProposals ?? 0, icon: FileText,        color: "bg-[#fef9c3] text-[#a16207]", href: "/propuestas" },
    { label: "Controles",         value: upcomingControls?.length ?? 0, icon: ClipboardCheck, color: "bg-[#ffdad6] text-[#93000a]", href: "/controles" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#151c27]">Resumen del día</h1>
          <p className="text-sm text-[#797588] capitalize">{today_str}</p>
        </div>
        <Link href="/agenda/nueva" className="btn-primary hidden sm:inline-flex">
          <Plus className="h-4 w-4" /> Nueva cita
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="card card-p flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#151c27]">{s.value}</p>
              <p className="text-xs text-[#797588]">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Citas de hoy */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="font-semibold text-[#151c27]">Citas de hoy</h2>
            <Link href="/agenda" className="flex items-center gap-1 text-xs font-medium text-[#5427e6] hover:text-[#4500d8]">
              Ver agenda <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#f0f3ff]">
            {!todayAppointments?.length ? (
              <div className="px-6 py-10 text-center">
                <Calendar className="mx-auto h-8 w-8 text-[#c9c4d9] mb-2" />
                <p className="text-sm text-[#797588]">Ninguna cita programada hoy</p>
                <Link href="/agenda/nueva" className="mt-3 inline-block text-sm font-medium text-[#5427e6] hover:text-[#4500d8]">
                  + Nueva cita
                </Link>
              </div>
            ) : (
              todayAppointments.map((apt) => {
                const patient = apt.patients as { id: string; full_name: string } | null;
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="text-center w-14 shrink-0">
                      <p className="text-sm font-semibold text-[#151c27]">{formatTime(apt.starts_at)}</p>
                      <p className="text-[11px] text-[#797588]">{formatTime(apt.ends_at)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      {patient ? (
                        <Link href={`/pacientes/${patient.id}`} className="block text-sm font-medium text-[#151c27] hover:text-[#5427e6] truncate">
                          {patient.full_name}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-[#151c27] truncate">{apt.title}</p>
                      )}
                      <p className="text-xs text-[#797588] truncate">{apt.title}</p>
                    </div>
                    <span className={statusBadge[apt.status] ?? "badge-gray"}>
                      {statusLabel[apt.status] ?? apt.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Accesos rápidos */}
          <div className="card card-p">
            <h2 className="font-semibold text-[#151c27] mb-3">Accesos rápidos</h2>
            <div className="space-y-1">
              {[
                { href: "/pacientes/nuevo", label: "Nuevo paciente",   icon: Users,     color: "text-[#5427e6] bg-[#f0f3ff]" },
                { href: "/agenda/nueva",    label: "Nueva cita",       icon: Calendar,  color: "text-[#16a34a] bg-[#dcfce7]" },
                { href: "/propuestas/nueva",label: "Nueva propuesta",  icon: FileText,  color: "text-[#a16207] bg-[#fef9c3]" },
                { href: "/controles/nuevo", label: "Nuevo control",    icon: ClipboardCheck, color: "text-[#93000a] bg-[#ffdad6]" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-[#f9f9ff] transition-colors">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${item.color}`}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-[#151c27]">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Próximos controles */}
          {(upcomingControls?.length ?? 0) > 0 && (
            <div className="card card-p">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-[#151c27]">Controles</h2>
                <Link href="/controles" className="text-xs font-medium text-[#5427e6]">Ver todos</Link>
              </div>
              <div className="space-y-2">
                {upcomingControls!.map((c) => {
                  const p = c.patients as { id: string; full_name: string } | null;
                  const overdue = c.due_date && new Date(c.due_date) < new Date();
                  return (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${overdue ? "bg-[#ba1a1a]" : "bg-[#5427e6]"}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-[#151c27] truncate">{c.title}</p>
                        {p && <p className="text-xs text-[#797588]">{p.full_name}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
