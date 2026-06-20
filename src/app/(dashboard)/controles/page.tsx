import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import {
  Clock, CheckCircle, CalendarPlus, Eye, RefreshCw,
  TrendingUp, Stethoscope,
} from "lucide-react";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function relDate(d: string | null) {
  if (!d) return "Sin fecha";
  const date = new Date(d);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return `Hoy, ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Mañana, ${date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === -1) return "Ayer";
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
  return `En ${diffDays} días`;
}

function shortDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function isOverdue(d: string | null) {
  if (!d) return false;
  return new Date(d) < new Date();
}

export default async function ControlesPage() {
  const supabase = createAdminClient();
  const [{ data: controls }, { count: totalMonth }] = await Promise.all([
    supabase
      .from("controls")
      .select("id, title, notes, status, due_date, completed_at, patient_id, patients(id, full_name)")
      .eq("clinic_id", DEMO_CLINIC_ID)
      .neq("status", "cancelled")
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("controls")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .gte("due_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  const all = controls ?? [];
  const pending = all.filter((c) => c.status === "pending" || c.status === "scheduled");
  const completed = all.filter((c) => c.status === "completed");
  const todayCount = pending.filter((c) => {
    if (!c.due_date) return false;
    const d = new Date(c.due_date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  }).length;

  const effectPct = all.length > 0
    ? Math.round((completed.length / all.length) * 100)
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 border-b border-[#c9c4d9]">
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="search"
            placeholder="Buscar pacientes o controles..."
            className="w-full bg-[#f0f3ff] border border-[#c9c4d9] rounded-full py-2 pl-10 pr-4 text-[14px] focus:ring-2 focus:ring-[#5427e6] focus:border-[#5427e6] outline-none transition-all"
          />
        </div>
        <Link href="/controles/nuevo"
          className="flex items-center gap-2 px-5 py-2 bg-[#5427e6] text-white rounded-full text-[14px] font-medium hover:bg-[#6d4aff] transition-all shrink-0 ml-4">
          <CalendarPlus className="w-4 h-4" /> Nuevo control
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#151c27]">Controles</h2>
              <p className="text-[16px] text-[#484556] mt-1">Gestión y seguimiento del viaje post-operatorio de tus pacientes.</p>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1 bg-[#f0f3ff] p-1 rounded-xl border border-[#c9c4d9]">
              <Link href="/controles"
                className="px-4 py-2 bg-white text-[#5427e6] text-[14px] font-medium rounded-lg shadow-sm border border-[#c9c4d9]">
                Todos
              </Link>
              <Link href="/controles?filtro=proximos"
                className="px-4 py-2 text-[#484556] text-[14px] font-medium hover:bg-[#e7eefe] rounded-lg transition-colors">
                Próximos
              </Link>
              <Link href="/controles?filtro=completados"
                className="px-4 py-2 text-[#484556] text-[14px] font-medium hover:bg-[#e7eefe] rounded-lg transition-colors">
                Completados
              </Link>
            </div>
          </div>

          {/* Bento grid 3 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Timeline col-span-2 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-semibold flex items-center gap-2 text-[#151c27]">
                  <Clock className="w-5 h-5 text-[#5427e6]" />
                  Próximos Controles
                </h3>
                {todayCount > 0 && (
                  <span className="bg-[#6d4aff] text-white px-3 py-1 rounded-full text-[12px] font-medium">
                    {todayCount} pendiente{todayCount !== 1 ? "s" : ""} hoy
                  </span>
                )}
              </div>

              {pending.length === 0 ? (
                <div className="bg-white border border-dashed border-[#c9c4d9] rounded-xl p-12 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p className="text-[16px] font-medium text-[#151c27]">Sin controles pendientes</p>
                  <p className="text-[14px] text-[#797588] mt-1">¡Todo al día! Puedes agendar un nuevo control.</p>
                  <Link href="/controles/nuevo"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#5427e6] text-white rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                    <CalendarPlus className="w-4 h-4" /> Agendar control
                  </Link>
                </div>
              ) : (
                /* Timeline */
                <div className="relative pl-4 space-y-8 before:content-[''] before:absolute before:left-[23px] before:top-10 before:bottom-0 before:w-[2px] before:bg-[#e5e7eb]">
                  {pending.map((c, i) => {
                    const overdue = isOverdue(c.due_date);
                    const patient = c.patients as { id: string; full_name: string } | null;
                    return (
                      <div key={c.id} className="relative pl-10 group">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-[#f9f9ff] z-10 ${
                          i === 0 ? "bg-[#5427e6]" : overdue ? "bg-red-400" : "bg-[#c9bfff]"
                        }`} />
                        <div className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 ${
                          overdue ? "border-red-200" : "border-[#c9c4d9]"
                        }`}>
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div className="flex gap-4 items-center">
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] font-bold text-[16px] shrink-0">
                                {patient ? initials(patient.full_name) : "?"}
                              </div>
                              <div>
                                {patient ? (
                                  <Link href={`/pacientes/${patient.id}`}
                                    className="text-[20px] font-semibold text-[#151c27] hover:text-[#5427e6] transition-colors">
                                    {patient.full_name}
                                  </Link>
                                ) : (
                                  <p className="text-[20px] font-semibold text-[#151c27]">Paciente</p>
                                )}
                                <p className="text-[14px] text-[#484556]">{c.title}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="bg-[#d9dff5] text-[#484556] px-3 py-1 rounded-full text-[12px] font-medium inline-block mb-1">
                                Control programado
                              </span>
                              <p className={`text-[14px] font-medium ${overdue ? "text-red-500" : "text-[#5427e6]"}`}>
                                {relDate(c.due_date)}
                              </p>
                            </div>
                          </div>
                          {c.notes && (
                            <div className="flex items-start gap-2 mb-5">
                              <Stethoscope className="w-4 h-4 text-[#797588] shrink-0 mt-0.5" />
                              <p className="text-[14px] text-[#484556] italic">{c.notes}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/controles/${c.id}/completar`}
                              className="flex-1 bg-[#5427e6] text-white px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Completar control
                            </Link>
                            <Link href={`/controles/nuevo?paciente=${c.patient_id ?? ""}`}
                              className="flex-1 border border-[#c9c4d9] text-[#151c27] px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-[#e7eefe] transition-all flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4" /> Reagendar
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-6">

              {/* Agendar control — purple CTA card */}
              <div className="bg-[#6d4aff] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-[20px] font-semibold mb-2">Agendar Control</h3>
                  <p className="text-white/80 text-[14px] mb-6">Asigna un nuevo espacio de seguimiento para un paciente existente.</p>
                  <Link href="/controles/nuevo"
                    className="w-full bg-white text-[#5427e6] text-[14px] font-bold py-3 rounded-xl hover:bg-[#e5deff] transition-colors flex items-center justify-center gap-2">
                    <CalendarPlus className="w-4 h-4" /> Agendar ahora
                  </Link>
                </div>
                <Stethoscope className="absolute -right-4 -bottom-4 w-28 h-28 text-white opacity-10" />
              </div>

              {/* Completed controls */}
              {completed.length > 0 && (
                <div className="bg-white border border-[#c9c4d9] rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-[#c9c4d9] flex items-center justify-between">
                    <h3 className="text-[12px] font-bold text-[#797588] uppercase tracking-wider">Recientemente Completados</h3>
                    <Link href="/controles?filtro=completados"
                      className="text-[12px] text-[#5427e6] hover:underline font-medium">
                      Ver todo
                    </Link>
                  </div>
                  <div className="divide-y divide-[#c9c4d9]">
                    {completed.slice(0, 5).map((c) => {
                      const patient = c.patients as { id: string; full_name: string } | null;
                      return (
                        <div key={c.id}
                          className="p-4 flex items-center gap-3 hover:bg-[#f0f3ff] transition-colors">
                          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-[#151c27] truncate">
                              {patient?.full_name ?? "Paciente"}
                            </p>
                            <p className="text-[11px] text-[#797588] truncate">{c.title}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] text-[#797588]">{shortDate(c.completed_at)}</p>
                            {patient && (
                              <Link href={`/pacientes/${patient.id}`}
                                title="Ver paciente">
                                <Eye className="w-4 h-4 text-[#5427e6] mt-0.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly progress */}
              <div className="bg-[#e7eefe] rounded-2xl p-6">
                <h4 className="text-[14px] font-medium text-[#484556] mb-4">Progreso Mensual</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#484556]">Controles realizados</span>
                    <span className="text-[14px] font-medium text-[#151c27]">
                      {completed.length}/{totalMonth ?? all.length}
                    </span>
                  </div>
                  <div className="w-full bg-[#f9f9ff] rounded-full h-2">
                    <div className={`bg-[#5427e6] h-2 rounded-full transition-all duration-700 ${
                      effectPct >= 90 ? "w-[90%]"
                      : effectPct >= 75 ? "w-3/4"
                      : effectPct >= 50 ? "w-1/2"
                      : effectPct >= 25 ? "w-1/4"
                      : "w-[8%]"
                    }`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-[#c9c4d9]">
                      <p className="text-[10px] text-[#797588] uppercase tracking-wider">Efectividad</p>
                      <p className="text-[20px] font-semibold text-[#5427e6] flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {effectPct}%
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#c9c4d9]">
                      <p className="text-[10px] text-[#797588] uppercase tracking-wider">Pendientes</p>
                      <p className="text-[20px] font-semibold text-[#575e70]">{pending.length}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FAB mobile */}
      <Link href="/controles/nuevo"
        className="fixed bottom-20 md:bottom-8 right-8 w-14 h-14 bg-[#5427e6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50 md:hidden">
        <CalendarPlus className="w-6 h-6" />
      </Link>
    </div>
  );
}
