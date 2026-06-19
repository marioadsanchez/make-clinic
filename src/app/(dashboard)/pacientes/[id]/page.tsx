import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Patient, MedicalRecord } from "@/lib/types";

export const runtime = "edge";

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "";
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + " años";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

const statusColors: Record<string, string> = {
  draft: "text-gray-500", sent: "text-blue-600", viewed: "text-yellow-600",
  approved: "text-green-600", signed: "text-green-700", rejected: "text-red-600",
  scheduled: "text-blue-600", confirmed: "text-green-600", in_progress: "text-blue-700",
  completed: "text-gray-500", cancelled: "text-red-600", no_show: "text-red-400",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador", sent: "Enviada", viewed: "Vista", approved: "Aprobada",
  signed: "Firmada", rejected: "Rechazada", expired: "Expirada",
  scheduled: "Programada", confirmed: "Confirmada", in_progress: "En curso",
  completed: "Completada", cancelled: "Cancelada", no_show: "No asistió",
};

export default async function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: patient }, { data: record }, { data: appointments }, { data: proposals }, { data: consultations }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase.from("medical_records").select("*").eq("patient_id", id).maybeSingle(),
    supabase.from("appointments").select("id, title, starts_at, status").eq("patient_id", id).order("starts_at", { ascending: false }).limit(5),
    supabase.from("proposals").select("id, title, status, final_price, created_at").eq("patient_id", id).order("created_at", { ascending: false }).limit(5),
    supabase.from("consultations").select("id, date, chief_complaint, diagnosis, notes").eq("patient_id", id).order("date", { ascending: false }).limit(5),
  ]);

  if (!patient) notFound();
  const p = patient as Patient;
  const mr = record as MedicalRecord | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/pacientes" className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {p.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{p.full_name}</h1>
            <p className="text-sm text-gray-500">
              {[p.birth_date ? `${formatDate(p.birth_date)} · ${calcAge(p.birth_date)}` : null, p.sex ? ({ male: "Masculino", female: "Femenino", other: "Otro" }[p.sex]) : null].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <Link href={`/pacientes/${id}/editar`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Editar
        </Link>
      </div>

      {/* Contacto */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Contacto</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {p.phone && (
            <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Phone className="h-4 w-4 text-gray-400" /> {p.phone}
            </a>
          )}
          {p.phone && (
            <a href={`https://wa.me/${p.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
              <MessageCircle className="h-4 w-4 text-gray-400" /> WhatsApp
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {p.email}
            </a>
          )}
          {p.address && (
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" /> {[p.address, p.city].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
        {p.emergency_contact_name && (
          <p className="mt-3 text-sm text-gray-500">
            Emergencia: {p.emergency_contact_name}{p.emergency_contact_phone ? ` · ${p.emergency_contact_phone}` : ""}
          </p>
        )}
      </div>

      {/* Historia Clínica */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Historia Clínica</h2>
          <Link href={`/pacientes/${id}/historia`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {mr ? "Editar" : "Completar"}
          </Link>
        </div>
        <div className="p-6">
          {!mr ? (
            <p className="text-sm text-gray-500">No se ha completado la historia clínica.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              {mr.aesthetic_complaints && (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Motivo estético</p>
                <p className="mt-1 text-gray-700">{mr.aesthetic_complaints}</p></div>
              )}
              {p.allergies?.length ? (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Alergias</p>
                <p className="mt-1 text-gray-700">{p.allergies.join(", ")}</p></div>
              ) : null}
              {p.chronic_conditions?.length ? (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Condiciones crónicas</p>
                <p className="mt-1 text-gray-700">{p.chronic_conditions.join(", ")}</p></div>
              ) : null}
              {p.current_medications?.length ? (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Medicamentos actuales</p>
                <p className="mt-1 text-gray-700">{p.current_medications.join(", ")}</p></div>
              ) : null}
              {mr.surgical_history && (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Cirugías previas</p>
                <p className="mt-1 text-gray-700">{mr.surgical_history}</p></div>
              )}
              {mr.habits && (
                <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Hábitos</p>
                <p className="mt-1 text-gray-700">{mr.habits}</p></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consultas (timeline) */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Consultas Clínicas</h2>
          <Link href={`/pacientes/${id}/consultas/nueva`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Nueva
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {!consultations?.length ? (
            <p className="px-6 py-6 text-center text-sm text-gray-500">Sin consultas registradas.</p>
          ) : (
            consultations.map((c) => (
              <Link key={c.id} href={`/pacientes/${id}/consultas/${c.id}`}
                className="block px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{c.chief_complaint ?? "Consulta"}</p>
                  <p className="text-xs text-gray-400">{formatDate(c.date)}</p>
                </div>
                {c.diagnosis && <p className="mt-1 text-xs text-gray-500">Dx: {c.diagnosis}</p>}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Agenda */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Citas</h2>
          <Link href={`/agenda/nueva?paciente=${id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700">+ Nueva</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {!appointments?.length ? (
            <p className="px-6 py-6 text-center text-sm text-gray-500">Sin citas registradas.</p>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(a.starts_at)}</p>
                </div>
                <span className={`text-xs font-medium ${statusColors[a.status] ?? "text-gray-500"}`}>
                  {statusLabels[a.status] ?? a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Propuestas */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Propuestas</h2>
          <Link href={`/propuestas/nueva?paciente=${id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700">+ Nueva</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {!proposals?.length ? (
            <p className="px-6 py-6 text-center text-sm text-gray-500">Sin propuestas.</p>
          ) : (
            proposals.map((prop) => (
              <Link key={prop.id} href={`/propuestas/${prop.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{prop.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(prop.created_at)}</p>
                </div>
                <div className="text-right">
                  {prop.final_price && (
                    <p className="text-sm font-semibold text-gray-900">${prop.final_price.toLocaleString("es-MX")}</p>
                  )}
                  <span className={`text-xs font-medium ${statusColors[prop.status] ?? "text-gray-500"}`}>
                    {statusLabels[prop.status] ?? prop.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <p className="text-right text-xs text-gray-400">Paciente desde {formatDate(p.created_at)}</p>
    </div>
  );
}
