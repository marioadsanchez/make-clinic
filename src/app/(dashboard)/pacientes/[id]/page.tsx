import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, MessageCircle } from "lucide-react";
import type { Patient } from "@/lib/types";

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

export default async function PacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: patient }, { data: appointments }, { data: proposals }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase.from("appointments")
      .select("id, title, start_at, status")
      .eq("patient_id", id)
      .order("start_at", { ascending: false })
      .limit(5),
    supabase.from("proposals")
      .select("id, title, status, price, created_at")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!patient) notFound();
  const p = patient as Patient;

  const statusColors: Record<string, string> = {
    draft: "text-gray-500", sent: "text-blue-600", viewed: "text-yellow-600",
    approved: "text-green-600", signed: "text-green-700", rejected: "text-red-600",
    scheduled: "text-blue-600", confirmed: "text-green-600", completed: "text-gray-500", cancelled: "text-red-600",
  };
  const statusLabels: Record<string, string> = {
    draft: "Borrador", sent: "Enviada", viewed: "Vista", approved: "Aprobada",
    signed: "Firmada", rejected: "Rechazada", scheduled: "Programada",
    confirmed: "Confirmada", completed: "Completada", cancelled: "Cancelada",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/pacientes" className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
            <p className="text-sm text-gray-500">
              {p.birth_date ? `${formatDate(p.birth_date)} · ${calcAge(p.birth_date)}` : "Sin fecha de nacimiento"}
            </p>
          </div>
        </div>
        <Link
          href={`/pacientes/${id}/editar`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
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
          {p.whatsapp && (
            <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
              <MessageCircle className="h-4 w-4 text-gray-400" /> {p.whatsapp}
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {p.email}
            </a>
          )}
          {p.address && (
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" /> {p.address}
            </span>
          )}
        </div>
        {p.document && (
          <p className="mt-3 text-sm text-gray-500">Documento: {p.document}</p>
        )}
      </div>

      {/* Notas */}
      {p.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-gray-900">Notas</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.notes}</p>
        </div>
      )}

      {/* Consultas recientes */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Consultas</h2>
          <Link href={`/agenda/nueva?paciente=${id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Nueva
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {!appointments?.length ? (
            <p className="px-6 py-6 text-center text-sm text-gray-500">Sin consultas registradas.</p>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(a.start_at)}</p>
                </div>
                <span className={`text-xs font-medium ${statusColors[a.status] ?? "text-gray-500"}`}>
                  {statusLabels[a.status] ?? a.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Propuestas recientes */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Propuestas</h2>
          <Link href={`/propuestas/nueva?paciente=${id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Nueva
          </Link>
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
                  {prop.price && (
                    <p className="text-sm font-semibold text-gray-900">
                      ${prop.price.toLocaleString("es-MX")}
                    </p>
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
