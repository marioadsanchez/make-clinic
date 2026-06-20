import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users, Plus, TrendingUp, CalendarCheck, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

export const runtime = "edge";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#d9dff5] text-[#5427e6]",
  "bg-[#e5deff] text-[#4500d8]",
  "bg-[#dce2f7] text-[#484556]",
  "bg-[#e2e8f8] text-[#151c27]",
  "bg-[#ffdad6] text-[#93000a]",
];

const PAGE_SIZE = 20;

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  let query = supabase
    .from("patients")
    .select("id, full_name, date_of_birth, phone, email, allergies", { count: "exact" })
    .eq("clinic_id", DEMO_CLINIC_ID)
    .eq("active", true)
    .order("full_name")
    .range(from, to);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: patients, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Stats
  const [{ count: newThisMonth }, { count: todayAppts }] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("appointments").select("*", { count: "exact", head: true })
      .eq("clinic_id", DEMO_CLINIC_ID)
      .gte("starts_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lte("starts_at", new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 w-full">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484556]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <form method="GET" action="/pacientes">
              <input name="q" defaultValue={q}
                placeholder="Buscar paciente..."
                className="w-full bg-[#f0f3ff] border border-[#c9c4d9] rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all text-[#151c27] placeholder:text-[#797588]" />
            </form>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pacientes/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-xl text-sm font-medium hover:bg-[#6d4aff] transition-all active:scale-95 shadow-sm">
            <Plus className="w-4 h-4" />
            Nuevo paciente
          </Link>
          <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-sm font-bold text-[#5427e6]">
            DR
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 md:pb-6">
        {/* Page header + filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#151c27]">Pacientes</h2>
            <p className="text-[14px] text-[#484556] mt-1">Gestione y supervise el progreso clínico de sus pacientes.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#797588]">Estado</label>
              <select aria-label="Filtrar por estado"
                className="bg-white border border-[#c9c4d9] rounded-lg px-3 py-1.5 text-[14px] min-w-[140px] focus:ring-1 focus:ring-[#5427e6] outline-none text-[#151c27]">
                <option>Todos</option>
                <option>Consulta</option>
                <option>En tratamiento</option>
                <option>Postoperatorio</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#797588]">Procedimiento</label>
              <select aria-label="Filtrar por procedimiento"
                className="bg-white border border-[#c9c4d9] rounded-lg px-3 py-1.5 text-[14px] min-w-[160px] focus:ring-1 focus:ring-[#5427e6] outline-none text-[#151c27]">
                <option>Todos</option>
                <option>Rinoplastia</option>
                <option>Botox</option>
                <option>Lipoescultura</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white border border-[#c9c4d9] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {!patients?.length ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-[#e7eefe] flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-[#5427e6]" />
                </div>
                <h3 className="font-semibold text-[#151c27]">{q ? "Sin resultados" : "Sin pacientes"}</h3>
                <p className="mt-1 text-[14px] text-[#484556]">
                  {q ? `No se encontró "${q}".` : "Registra el primer paciente."}
                </p>
                {!q && (
                  <Link href="/pacientes/nuevo" className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#5427e6] text-white rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                    <Plus className="w-4 h-4" /> Nuevo paciente
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#c9c4d9] bg-[#f0f3ff]">
                    <th className="px-6 py-4 text-[12px] font-medium text-[#484556] uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#484556] uppercase tracking-wider hidden md:table-cell">Teléfono</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#484556] uppercase tracking-wider hidden lg:table-cell">Alergias</th>
                    <th className="px-6 py-4 text-[12px] font-medium text-[#484556] uppercase tracking-wider hidden lg:table-cell">Estado</th>
                    <th className="px-6 py-4" scope="col"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9c4d9]">
                  {patients.map((p, i) => {
                    const hasAllergies = (p.allergies as string[] | null)?.length ?? 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#f9f9ff] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                              {initials(p.full_name)}
                            </div>
                            <div>
                              <Link href={`/pacientes/${p.id}`}
                                className="text-[14px] font-medium text-[#151c27] hover:text-[#5427e6] transition-colors">
                                {p.full_name}
                              </Link>
                              {p.email && <div className="text-[12px] text-[#797588]">{p.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-[#484556] hidden md:table-cell">
                          {p.phone ?? "—"}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {hasAllergies ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[12px] font-medium">
                              ⚠ {(p.allergies as string[]).join(", ")}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#c9c4d9]">Ninguna</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e7eefe] text-[#484556] text-[12px] font-medium border border-[#c9c4d9]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5427e6]" />
                            Activo
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/pacientes/${p.id}`}
                              className="px-3 py-1 border border-[#c9c4d9] rounded-lg text-[12px] font-medium text-[#484556] hover:bg-[#e7eefe] transition-colors">
                              Ver ficha
                            </Link>
                            <Link href={`/pacientes/${p.id}/consultas/nueva`}
                              className="px-3 py-1 bg-[#5427e6] text-white rounded-lg text-[12px] font-medium hover:bg-[#6d4aff] transition-colors">
                              + Consulta
                            </Link>
                            <button type="button" title="Más opciones" className="p-1 text-[#484556] hover:text-[#5427e6] transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {(count ?? 0) > 0 && (
            <div className="px-6 py-4 border-t border-[#c9c4d9] bg-[#f0f3ff] flex items-center justify-between">
              <span className="text-[14px] text-[#484556]">
                Mostrando {from + 1} a {Math.min(to + 1, count ?? 0)} de {count} pacientes
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/pacientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                  aria-disabled={page <= 1}
                  className={`p-2 border border-[#c9c4d9] rounded-lg text-[#484556] hover:bg-white transition-colors ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                  <Link key={n} href={`/pacientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[14px] font-medium transition-colors ${
                      n === page ? "bg-[#5427e6] text-white shadow-sm" : "text-[#484556] hover:bg-white"
                    }`}>
                    {n}
                  </Link>
                ))}
                <Link
                  href={`/pacientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                  aria-disabled={page >= totalPages}
                  className={`p-2 border border-[#c9c4d9] rounded-lg text-[#484556] hover:bg-white transition-colors ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Info cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#e7eefe] border border-[#c9c4d9] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <TrendingUp className="w-5 h-5 text-[#5427e6] mb-2" />
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-1">Crecimiento</h3>
              <p className="text-[14px] text-[#484556]">Nuevos pacientes este mes</p>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-[48px] font-bold leading-none text-[#5427e6]">{newThisMonth ?? 0}</span>
              <span className="text-green-700 text-[14px] font-medium flex items-center mb-2 gap-0.5">
                <TrendingUp className="w-4 h-4" /> +12%
              </span>
            </div>
          </div>

          <div className="bg-[#e7eefe] border border-[#c9c4d9] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <CalendarCheck className="w-5 h-5 text-[#575e70] mb-2" />
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-1">Consultas</h3>
              <p className="text-[14px] text-[#484556]">Citas agendadas hoy</p>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-[48px] font-bold leading-none text-[#575e70]">{todayAppts ?? 0}</span>
              <span className="text-[#797588] text-[14px] font-medium mb-2">programadas</span>
            </div>
          </div>

          <div className="bg-[#6d4aff] text-white rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-[20px] font-semibold leading-[1.4] mb-2">Recordatorio</h3>
                <p className="text-[14px] opacity-90 leading-relaxed">
                  Revisa los pacientes en postoperatorio que requieren seguimiento hoy.
                </p>
              </div>
              <Link href="/controles"
                className="mt-4 w-fit px-4 py-2 bg-white text-[#5427e6] rounded-xl text-[14px] font-medium hover:scale-105 active:scale-95 transition-all">
                Ver controles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAB mobile */}
      <Link href="/pacientes/nuevo"
        className="fixed bottom-20 md:bottom-8 right-8 w-14 h-14 bg-[#5427e6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50 md:hidden">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
