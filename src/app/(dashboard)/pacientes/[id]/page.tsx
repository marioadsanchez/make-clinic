import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, CalendarPlus, Printer,
  Edit, Clock, FileText, Camera, MessageSquare, ChevronRight,
} from "lucide-react";
import type { Patient, MedicalRecord } from "@/lib/types";

export const runtime = "edge";

function calcAge(dob: string | null) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) +
    " · " + new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const PROPOSAL_STATUS: Record<string, { label: string; cls: string }> = {
  draft:    { label: "BORRADOR",  cls: "bg-[#e7eefe] text-[#484556]" },
  sent:     { label: "ENVIADO",   cls: "bg-blue-100 text-blue-700" },
  viewed:   { label: "VISTO",     cls: "bg-yellow-100 text-yellow-700" },
  approved: { label: "APROBADO",  cls: "bg-green-100 text-green-700" },
  signed:   { label: "FIRMADO",   cls: "bg-green-100 text-green-700" },
  rejected: { label: "RECHAZADO", cls: "bg-red-100 text-red-700" },
};

const APT_STATUS: Record<string, { label: string; dot: string }> = {
  scheduled:   { label: "Programada",  dot: "bg-blue-500" },
  confirmed:   { label: "Confirmada",  dot: "bg-green-500" },
  in_progress: { label: "En curso",    dot: "bg-[#5427e6]" },
  completed:   { label: "Completada",  dot: "bg-[#797588]" },
  cancelled:   { label: "Cancelada",   dot: "bg-red-500" },
  no_show:     { label: "No asistió",  dot: "bg-red-400" },
};

export default async function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [
    { data: patient },
    { data: record },
    { data: appointments },
    { data: proposals },
    { data: consultations },
  ] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase.from("medical_records").select("*").eq("patient_id", id).maybeSingle(),
    supabase.from("appointments").select("id, title, starts_at, ends_at, status, type")
      .eq("patient_id", id).order("starts_at", { ascending: false }).limit(5),
    supabase.from("proposals").select("id, title, status, final_price, total_price, created_at")
      .eq("patient_id", id).order("created_at", { ascending: false }).limit(5),
    supabase.from("consultations").select("id, date, chief_complaint, diagnosis, notes, treatment_plan")
      .eq("patient_id", id).order("date", { ascending: false }).limit(5),
  ]);

  if (!patient) notFound();
  const p = patient as Patient;
  const mr = record as MedicalRecord | null;
  const age = calcAge(p.date_of_birth ?? p.birth_date ?? null);

  const nextApt = appointments?.find(a => new Date(a.starts_at) > new Date() && a.status !== "cancelled");
  const lastConsult = consultations?.[0];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center gap-4 px-6 border-b border-[#c9c4d9]">
        <Link href="/pacientes" className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-[14px] text-[#484556]">Pacientes</span>
        <ChevronRight className="w-4 h-4 text-[#c9c4d9]" />
        <span className="text-[14px] font-medium text-[#151c27] truncate">{p.full_name}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl mx-auto w-full space-y-8 pb-20 md:pb-8">

        {/* ── Hero Card ── */}
        <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm relative overflow-hidden">
          {/* Active badge */}
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-[12px] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              Paciente Activo
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] text-3xl font-bold border-4 border-white shadow-md">
                {initials(p.full_name)}
              </div>
              <Link href={`/pacientes/${id}/editar`}
                className="absolute bottom-0 right-0 p-1.5 bg-[#5427e6] text-white rounded-full shadow-lg border-2 border-white hover:bg-[#6d4aff] transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#151c27]">{p.full_name}</h2>
                <p className="text-[14px] text-[#484556] mt-0.5">
                  {age ? `${age} años` : ""}
                  {p.sex ? ` • ${p.sex === "female" ? "Mujer" : p.sex === "male" ? "Hombre" : "Otro"}` : ""}
                  {p.date_of_birth || p.birth_date
                    ? ` • ${formatDate(p.date_of_birth ?? p.birth_date ?? null)}`
                    : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-[14px] text-[#484556] hover:text-[#5427e6] transition-colors">
                    <Phone className="w-4 h-4 text-[#5427e6] shrink-0" />
                    {p.phone}
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-[14px] text-[#484556] hover:text-[#5427e6] transition-colors truncate">
                    <Mail className="w-4 h-4 text-[#5427e6] shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </a>
                )}
                {(p.address || p.city) && (
                  <span className="flex items-center gap-2 text-[14px] text-[#484556]">
                    <MapPin className="w-4 h-4 text-[#5427e6] shrink-0" />
                    {[p.address, p.city].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-2 text-[14px] text-[#484556]">
                  <CalendarPlus className="w-4 h-4 text-[#5427e6] shrink-0" />
                  Desde: {formatDate(p.created_at ?? null)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link href={`/pacientes/${id}/consultas/nueva`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5427e6] text-white rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                <CalendarPlus className="w-4 h-4" /> Nueva Consulta
              </Link>
              <Link href={`/pacientes/${id}/editar`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#c9c4d9] rounded-lg text-[14px] font-medium text-[#151c27] hover:bg-[#e7eefe] transition-all">
                <Edit className="w-4 h-4" /> Editar ficha
              </Link>
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <nav className="flex border-b border-[#c9c4d9] overflow-x-auto gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "Resumen",            href: `/pacientes/${id}` },
            { label: "Historia clínica",   href: `/pacientes/${id}/historia` },
            { label: "Consultas",          href: `/pacientes/${id}/consultas` },
            { label: "Propuestas",         href: `/propuestas?paciente=${id}` },
            { label: "Fotos",              href: `/pacientes/${id}/fotos` },
            { label: "Documentos",         href: `/documentos?paciente=${id}` },
            { label: "Controles",          href: `/controles?paciente=${id}` },
          ].map((t, i) => (
            <Link key={t.href}
              href={t.href}
              className={`pb-4 px-1 whitespace-nowrap text-[14px] font-medium border-b-2 transition-colors ${
                i === 0
                  ? "border-[#5427e6] text-[#5427e6] font-bold"
                  : "border-transparent text-[#484556] hover:text-[#151c27]"
              }`}>
              {t.label}
            </Link>
          ))}
        </nav>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* LEFT: 4 cols */}
          <div className="md:col-span-4 space-y-6">
            {/* Información personal */}
            <div className="bg-white border border-[#c9c4d9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Información personal</h3>
                <Link href={`/pacientes/${id}/editar`}
                  className="p-1 rounded-md text-[#5427e6] hover:bg-[#e5deff] transition-colors">
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
              <dl className="space-y-4">
                {(p.address || p.city) && (
                  <div>
                    <dt className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Dirección</dt>
                    <dd className="text-[16px] text-[#151c27] mt-1">{[p.address, p.city].filter(Boolean).join(", ")}</dd>
                  </div>
                )}
                {(p.date_of_birth ?? p.birth_date) && (
                  <div>
                    <dt className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Fecha de nacimiento</dt>
                    <dd className="text-[16px] text-[#151c27] mt-1">{formatDate(p.date_of_birth ?? p.birth_date ?? null)}</dd>
                  </div>
                )}
                {(p.allergies as string[] | null)?.length ? (
                  <div>
                    <dt className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Alergias</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {(p.allergies as string[]).map(a => (
                        <span key={a} className="px-2 py-0.5 bg-red-100 text-red-700 text-[12px] font-bold rounded">{a}</span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {(p.chronic_conditions as string[] | null)?.length ? (
                  <div>
                    <dt className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Antecedentes</dt>
                    <dd className="text-[14px] text-[#484556] mt-1">{(p.chronic_conditions as string[]).join(", ")}</dd>
                  </div>
                ) : null}
                {mr?.aesthetic_complaints && (
                  <div>
                    <dt className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Motivo estético</dt>
                    <dd className="text-[14px] text-[#484556] mt-1">{mr.aesthetic_complaints}</dd>
                  </div>
                )}
                {!mr && !p.allergies?.length && !p.address && (
                  <div>
                    <dd className="text-[14px] text-[#797588]">
                      <Link href={`/pacientes/${id}/historia`} className="text-[#5427e6] hover:underline">
                        Completar historia clínica →
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Plan de tratamiento (if last proposal) */}
            {proposals?.[0] && (
              <Link href={`/propuestas/${proposals[0].id}`}
                className="block bg-[#5427e6] text-white p-6 rounded-xl shadow-lg shadow-[#5427e6]/20 relative overflow-hidden hover:bg-[#6d4aff] transition-colors">
                <div className="relative z-10">
                  <span className="text-[12px] font-medium text-white/80 uppercase tracking-wider">Plan de Tratamiento</span>
                  <h3 className="text-[20px] font-semibold leading-[1.4] mt-2">{proposals[0].title}</h3>
                  {proposals[0].final_price != null && (
                    <p className="text-[14px] text-white/80 mt-1">
                      ${(proposals[0].final_price).toLocaleString("es-MX")}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex-1 bg-white/20 h-1.5 rounded-full">
                      <div className={`bg-white h-1.5 rounded-full ${
                        proposals[0].status === "signed" ? "w-full"
                        : proposals[0].status === "approved" ? "w-3/4"
                        : proposals[0].status === "viewed" ? "w-1/2"
                        : proposals[0].status === "sent" ? "w-1/4"
                        : "w-[8%]"
                      }`} />
                    </div>
                    <span className="text-[14px] font-bold">{PROPOSAL_STATUS[proposals[0].status]?.label ?? proposals[0].status}</span>
                  </div>
                </div>
                <FileText className="absolute -bottom-4 -right-4 w-28 h-28 text-white opacity-10" />
              </Link>
            )}
          </div>

          {/* CENTER: 5 cols */}
          <div className="md:col-span-5 space-y-6">
            {/* Próxima cita */}
            <div className="bg-[#e7eefe] border border-[#c9c4d9] rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Próxima cita</h3>
                  <p className="text-[14px] text-[#484556] mt-0.5">{nextApt?.title ?? "Sin citas programadas"}</p>
                </div>
                {nextApt && (
                  <div className="text-right">
                    <span className="text-[24px] font-semibold text-[#5427e6] block leading-none">
                      {new Date(nextApt.starts_at).getDate()}
                    </span>
                    <span className="text-[12px] font-medium text-[#484556] uppercase">
                      {new Date(nextApt.starts_at).toLocaleDateString("es-MX", { month: "short" })}
                    </span>
                  </div>
                )}
              </div>
              {nextApt ? (
                <div className="mt-5 flex items-center justify-between border-t border-[#c9c4d9] pt-4">
                  <div className="flex items-center gap-2 text-[#484556]">
                    <Clock className="w-4 h-4" />
                    <span className="text-[14px] font-medium">
                      {new Date(nextApt.starts_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      {nextApt.ends_at ? ` — ${new Date(nextApt.ends_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </span>
                  </div>
                  <Link href="/agenda" className="text-[#5427e6] font-bold text-[14px] hover:underline">Gestionar</Link>
                </div>
              ) : (
                <div className="mt-4">
                  <Link href={`/agenda/nueva?paciente=${id}`}
                    className="text-[14px] font-medium text-[#5427e6] hover:underline">
                    + Agendar cita
                  </Link>
                </div>
              )}
            </div>

            {/* Última consulta */}
            <div className="bg-white border border-[#c9c4d9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Última consulta</h3>
                <Link href={`/pacientes/${id}/consultas/nueva`}
                  className="flex items-center gap-1 text-[12px] font-medium text-[#5427e6] hover:underline">
                  <MessageSquare className="w-3.5 h-3.5" /> Nueva
                </Link>
              </div>
              {lastConsult ? (
                <div className="space-y-3">
                  <p className="text-[12px] font-medium text-[#797588]">
                    {formatDate(lastConsult.date)}
                  </p>
                  <div className="p-4 bg-[#f9f9ff] rounded-lg border border-[#c9c4d9]/50">
                    <p className="text-[16px] text-[#151c27] leading-relaxed italic">
                      "{lastConsult.chief_complaint ?? lastConsult.notes ?? "Sin detalle"}"
                    </p>
                  </div>
                  {lastConsult.diagnosis && (
                    <p className="text-[14px] text-[#484556]">
                      <span className="font-medium">Dx:</span> {lastConsult.diagnosis}
                    </p>
                  )}
                  <Link href={`/pacientes/${id}/consultas/${lastConsult.id}`}
                    className="block text-[12px] font-medium text-[#5427e6] hover:underline">
                    Ver consulta completa →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[14px] text-[#797588] mb-3">Sin consultas registradas.</p>
                  <Link href={`/pacientes/${id}/consultas/nueva`}
                    className="text-[14px] font-medium text-[#5427e6] hover:underline">
                    + Registrar consulta
                  </Link>
                </div>
              )}
            </div>

            {/* Historial de citas */}
            {appointments && appointments.length > 0 && (
              <div className="bg-white border border-[#c9c4d9] rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-[#c9c4d9] flex items-center justify-between">
                  <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Citas recientes</h3>
                  <Link href="/agenda" className="text-[12px] font-medium text-[#5427e6] hover:underline">Ver agenda</Link>
                </div>
                <div className="divide-y divide-[#c9c4d9]">
                  {appointments.slice(0, 4).map(a => {
                    const s = APT_STATUS[a.status] ?? { label: a.status, dot: "bg-[#797588]" };
                    return (
                      <div key={a.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-[#151c27]">{a.title}</p>
                          <p className="text-[12px] text-[#797588]">{formatDateTime(a.starts_at)}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium text-[#484556]`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: 3 cols */}
          <div className="md:col-span-3 space-y-6">
            {/* Propuestas recientes */}
            <div className="bg-white border border-[#c9c4d9] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Propuestas</h3>
                <Link href={`/propuestas/nueva?paciente=${id}`}
                  className="text-[12px] font-medium text-[#5427e6] hover:underline">+ Nueva</Link>
              </div>
              {proposals?.length ? (
                <div className="space-y-3">
                  {proposals.slice(0, 4).map(prop => {
                    const s = PROPOSAL_STATUS[prop.status] ?? { label: prop.status, cls: "bg-[#e7eefe] text-[#484556]" };
                    return (
                      <Link key={prop.id} href={`/propuestas/${prop.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#c9c4d9]/50 hover:bg-[#f0f3ff] transition-colors cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-[#151c27] truncate">{prop.title}</p>
                          {prop.final_price != null && (
                            <p className="text-[12px] text-[#484556]">${prop.final_price.toLocaleString("es-MX")}</p>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${s.cls}`}>
                          {s.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[14px] text-[#797588]">Sin propuestas.</p>
              )}
              {(proposals?.length ?? 0) > 0 && (
                <Link href={`/propuestas?paciente=${id}`}
                  className="w-full mt-4 block text-center py-1.5 text-[#5427e6] font-bold text-[14px] hover:underline">
                  Ver todas
                </Link>
              )}
            </div>

            {/* Actividad reciente */}
            <div className="bg-white border border-[#c9c4d9] rounded-xl p-6 shadow-sm">
              <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-5">Actividad</h3>
              <div className="relative space-y-5 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#c9c4d9]/50">
                {consultations?.slice(0, 3).map((c, i) => (
                  <div key={c.id} className="relative flex gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                      i === 0 ? "bg-[#5427e6]" : i === 1 ? "bg-[#575e70]" : "bg-[#797588]"
                    }`}>
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[#151c27]">Consulta registrada</p>
                      <p className="text-[12px] text-[#484556] truncate">{c.chief_complaint ?? "—"}</p>
                      <p className="text-[12px] text-[#797588]">{formatDate(c.date)}</p>
                    </div>
                  </div>
                ))}
                {(consultations?.length ?? 0) === 0 && (
                  <p className="pl-9 text-[14px] text-[#797588]">Sin actividad reciente.</p>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/pacientes/${id}/historia`}
                className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#c9c4d9] rounded-xl text-center hover:bg-[#e7eefe] transition-colors">
                <FileText className="w-5 h-5 text-[#5427e6]" />
                <span className="text-[12px] font-medium text-[#151c27]">Historia clínica</span>
              </Link>
              <Link href={`/documentos?paciente=${id}`}
                className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#c9c4d9] rounded-xl text-center hover:bg-[#e7eefe] transition-colors">
                <Printer className="w-5 h-5 text-[#5427e6]" />
                <span className="text-[12px] font-medium text-[#151c27]">Documentos</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* FAB mobile */}
      <Link href={`/pacientes/${id}/consultas/nueva`}
        className="fixed bottom-20 md:bottom-8 right-8 w-14 h-14 bg-[#5427e6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50 md:hidden">
        <CalendarPlus className="w-6 h-6" />
      </Link>
    </div>
  );
}
