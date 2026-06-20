import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Plus, Search, Bell, CalendarDays, ArrowRight, ChevronRight } from "lucide-react";

export const runtime = "edge";

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  scheduled:   { label: "Programada",  cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  confirmed:   { label: "Confirmado",  cls: "bg-green-50 text-green-700 border border-green-200" },
  in_progress: { label: "En curso",    cls: "bg-[#e5deff] text-[#5427e6] border border-[#c9bfff]" },
  completed:   { label: "Completada",  cls: "bg-[#e7eefe] text-[#484556] border border-[#c9c4d9]" },
  cancelled:   { label: "Cancelada",   cls: "bg-red-50 text-red-700 border border-red-200" },
  no_show:     { label: "No asistió",  cls: "bg-red-50 text-red-700 border border-red-200" },
  pending:     { label: "Por confirmar", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
};

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const todayStr = today.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const todayShort = today.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });

  const [
    { count: totalPatients },
    { data: todayAppointments },
    { count: totalProposals },
    { count: pendingSigns },
    { data: upcomingControls },
    { data: pendingProposals },
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
      .eq("clinic_id", DEMO_CLINIC_ID).in("status", ["draft", "sent", "viewed"]),
    supabase.from("proposals").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID).in("status", ["sent", "viewed"]),
    supabase.from("controls")
      .select("id, title, due_date, status, patients(id, full_name)")
      .eq("clinic_id", DEMO_CLINIC_ID).eq("status", "pending")
      .order("due_date", { ascending: true, nullsFirst: false }).limit(3),
    supabase.from("proposals")
      .select("id, title, total_price, final_price, patients(id, full_name), created_at, status, viewed_at")
      .eq("clinic_id", DEMO_CLINIC_ID).in("status", ["sent", "viewed", "draft"])
      .order("created_at", { ascending: false }).limit(3),
  ]);

  const kpis = [
    { label: "Citas/Controles",     value: (todayAppointments?.length ?? 0) + (upcomingControls?.length ?? 0), sub: `${todayAppointments?.length ?? 0} citas hoy`,        barW: "w-3/4",  barColor: "bg-[#5427e6]" },
    { label: "Propuestas enviadas", value: totalProposals ?? 0,   sub: `${pendingSigns ?? 0} pendientes`,                                                                  barW: "w-1/2",  barColor: "bg-[#6d4aff]" },
    { label: "Firmas pendientes",   value: pendingSigns ?? 0,     sub: (pendingSigns ?? 0) > 0 ? "Requieren atención" : "Al día",                                          barW: "w-4/5",  barColor: "bg-[#ba1a1a]" },
    { label: "Pacientes activos",   value: totalPatients ?? 0,    sub: "En seguimiento",                                                                                   barW: "w-2/3",  barColor: "bg-[#575e70]" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 w-full shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484556]" />
            <input
              className="w-full bg-[#f0f3ff] border border-[#c9c4d9] rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all text-[#151c27] placeholder:text-[#797588]"
              placeholder="Buscar paciente o cita..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" title="Notificaciones" className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556] relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
          </button>
          <button type="button" title="Calendario" className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556]">
            <CalendarDays className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-[#c9c4d9] mx-2" />
          <Link href="/agenda/nueva"
            className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-full text-sm font-medium hover:bg-[#6d4aff] transition-all active:scale-95 shadow-sm">
            <Plus className="w-4 h-4" />
            Nueva cita
          </Link>
          <div className="ml-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d9dff5] flex items-center justify-center text-sm font-semibold text-[#5427e6]">
              DR
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-[#151c27]">Dra. Admin</p>
              <p className="text-[10px] text-[#484556]">Director Médico</p>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 lg:px-8 lg:pb-8 space-y-6 pb-20 md:pb-8">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#151c27]">Resumen del día</h2>
            <p className="text-sm text-[#484556] capitalize">
              Bienvenida. Aquí tienes lo más importante para hoy.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e2e8f8] text-[#151c27] rounded-lg text-xs font-medium capitalize">
              <CalendarDays className="w-3.5 h-3.5" />
              {todayShort}
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k) => (
            <div key={k.label}
              className="bg-white border border-[#c9c4d9] p-6 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)] flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.08)] transition-all duration-200">
              <span className="text-sm font-medium text-[#484556]">{k.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#151c27]">{k.value}</span>
                <span className="text-xs text-[#5427e6] font-medium">{k.sub}</span>
              </div>
              <div className="mt-4 h-1 w-full bg-[#e7eefe] rounded-full">
                <div className={`h-full ${k.barColor} ${k.barW} rounded-full transition-all`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Citas + controles + firmas */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* Citas de hoy */}
            <section className="bg-white border border-[#c9c4d9] rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#c9c4d9] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#5427e6]" />
                  <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Citas de hoy</h3>
                </div>
                <Link href="/agenda" className="text-sm font-medium text-[#5427e6] hover:underline flex items-center gap-1">
                  Ver agenda completa <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                {!todayAppointments?.length ? (
                  <div className="px-6 py-10 text-center text-sm text-[#484556]">
                    No hay citas programadas para hoy.
                    <Link href="/agenda/nueva" className="ml-2 text-[#5427e6] hover:underline">+ Nueva cita</Link>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-[#f0f3ff]">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium text-[#484556]">Hora</th>
                        <th className="px-6 py-3 text-xs font-medium text-[#484556]">Paciente</th>
                        <th className="px-6 py-3 text-xs font-medium text-[#484556]">Procedimiento</th>
                        <th className="px-6 py-3 text-xs font-medium text-[#484556]">Estado</th>
                        <th className="px-6 py-3" scope="col"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c9c4d9]">
                      {todayAppointments.map((apt) => {
                        const patient = apt.patients as { id: string; full_name: string } | null;
                        const badge = statusBadge[apt.status] ?? { label: apt.status, cls: "bg-[#e7eefe] text-[#484556]" };
                        return (
                          <tr key={apt.id} className="hover:bg-[#f9f9ff] transition-colors group">
                            <td className="px-6 py-4 text-sm font-medium text-[#151c27]">{formatTime(apt.starts_at)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] text-xs font-bold">
                                  {patient ? initials(patient.full_name) : "?"}
                                </div>
                                <div>
                                  {patient ? (
                                    <Link href={`/pacientes/${patient.id}`} className="text-sm font-medium text-[#151c27] hover:text-[#5427e6]">
                                      {patient.full_name}
                                    </Link>
                                  ) : (
                                    <p className="text-sm font-medium text-[#151c27]">—</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#484556]">{apt.title}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button type="button" title="Opciones" className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#e7eefe] transition-all text-[#484556]">
                                ⋮
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Bottom split: controles + firmas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Próximos controles */}
              <section className="bg-white border border-[#c9c4d9] p-6 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Próximos controles</h3>
                  <Link href="/controles">
                    <ChevronRight className="w-5 h-5 text-[#484556]" />
                  </Link>
                </div>
                {!upcomingControls?.length ? (
                  <p className="text-sm text-[#484556]">Sin controles pendientes.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingControls.map((c) => {
                      const p = c.patients as { id: string; full_name: string } | null;
                      const overdue = c.due_date && new Date(c.due_date) < new Date();
                      return (
                        <div key={c.id} className="p-3 border border-[#c9c4d9] rounded-xl flex items-center justify-between bg-[#f9f9ff]">
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-8 rounded-full ${overdue ? "bg-[#ba1a1a]" : "bg-[#5427e6]"}`} />
                            <div>
                              <p className="text-sm font-medium text-[#151c27]">{p?.full_name ?? "—"}</p>
                              <p className="text-xs text-[#484556]">{c.title}</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#151c27]">
                            {c.due_date ? formatDateShort(c.due_date) : "Sin fecha"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Firmas pendientes */}
              <section className="bg-white border border-[#c9c4d9] p-6 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Firmas pendientes</h3>
                  {(pendingSigns ?? 0) > 0 && (
                    <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded text-[10px] font-bold">
                      {pendingSigns} URGENTES
                    </span>
                  )}
                </div>
                {(pendingSigns ?? 0) === 0 ? (
                  <p className="text-sm text-[#484556]">No hay firmas pendientes.</p>
                ) : (
                  <div className="space-y-2">
                    {(pendingProposals ?? []).filter(p => p.status === "sent" || p.status === "viewed").map((p) => {
                      const pat = p.patients as { id: string; full_name: string } | null;
                      return (
                        <Link key={p.id} href={`/propuestas/${p.id}`}
                          className="flex items-center gap-3 p-2 hover:bg-[#f9f9ff] rounded-lg transition-colors group">
                          <div className="w-5 h-5 text-[#484556] group-hover:text-[#5427e6] shrink-0">📄</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#151c27] truncate">{p.title}</p>
                            {pat && <p className="text-[10px] text-[#484556]">Paciente: {pat.full_name}</p>}
                          </div>
                          <span className="text-[#484556] text-xs">⏱</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Propuestas pendientes */}
            <section className="bg-white border border-[#c9c4d9] p-6 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Propuestas pendientes</h3>
                <Link href="/propuestas" className="text-[#5427e6] font-bold text-sm">{totalProposals ?? 0}</Link>
              </div>
              {!(pendingProposals?.length) ? (
                <p className="text-sm text-[#484556]">Sin propuestas pendientes.</p>
              ) : (
                <div className="space-y-4">
                  {pendingProposals.map((p, i) => {
                    const pat = p.patients as { id: string; full_name: string } | null;
                    const price = p.final_price ?? p.total_price;
                    const isFirst = i === 0;
                    return (
                      <Link key={p.id} href={`/propuestas/${p.id}`}
                        className={`block relative pl-4 border-l-2 hover:opacity-80 transition-opacity ${isFirst ? "border-[#c9bfff]" : "border-[#c9c4d9]"}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-[#151c27]">{p.title}</p>
                          {price != null && <span className="text-xs font-bold text-[#151c27]">${price.toLocaleString("es-MX")}</span>}
                        </div>
                        <p className="text-xs text-[#484556]">
                          {pat?.full_name ?? "—"} • {p.status === "viewed" ? "Vista" : "Enviada"}
                        </p>
                        {isFirst && (
                          <div className="mt-2 flex gap-2">
                            <span className="text-[10px] px-3 py-1 bg-[#5427e6] text-white rounded-full font-medium">Re-enviar</span>
                            <span className="text-[10px] px-3 py-1 border border-[#c9c4d9] rounded-full font-medium text-[#484556]">Ver detalles</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Actividad reciente */}
            <section className="bg-white border border-[#c9c4d9] p-6 rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)] flex-1">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-6 flex items-center gap-2">
                <span className="text-[#484556]">🕐</span>
                Actividad reciente
              </h3>
              <div className="relative space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#c9c4d9]">
                {[
                  { color: "bg-[#5427e6]", title: "Nueva cita creada", sub: "Paciente registrado", time: "Hace 5 min", timeColor: "text-[#5427e6]" },
                  { color: "bg-green-500",  title: "Propuesta firmada", sub: "Consentimiento completado", time: "Hace 45 min", timeColor: "text-[#484556]" },
                  { color: "bg-[#d9dff5]", title: "Documento enviado", sub: "Protocolo quirúrgico", time: "Hace 1h", timeColor: "text-[#484556]" },
                  { color: "bg-[#797588]", title: "Ficha actualizada", sub: "Historia clínica modificada", time: "Hace 3h", timeColor: "text-[#484556]" },
                ].map((a, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full ${a.color} ring-4 ring-white`} />
                    <p className="text-sm font-medium text-[#151c27]">{a.title}</p>
                    <p className="text-xs text-[#484556]">{a.sub}</p>
                    <p className={`text-[10px] mt-1 ${a.timeColor}`}>{a.time}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* FAB mobile */}
      <Link href="/agenda/nueva"
        className="fixed bottom-20 md:bottom-8 right-8 w-14 h-14 bg-[#5427e6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
