import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  const p = patient as Patient;

  const sexLabel = { male: "Masculino", female: "Femenino", other: "Otro" };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/pacientes" className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {p.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.full_name}</h1>
              <p className="text-sm text-gray-500">
                {p.birth_date ? `${formatDate(p.birth_date)} · ${calcAge(p.birth_date)}` : "Sin fecha de nacimiento"}
                {p.sex ? ` · ${sexLabel[p.sex] ?? p.sex}` : ""}
                {p.blood_type && p.blood_type !== "unknown" ? ` · ${p.blood_type}` : ""}
              </p>
            </div>
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
          {p.email && (
            <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {p.email}
            </a>
          )}
          {(p.city || p.state) && (
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" /> {[p.city, p.state].filter(Boolean).join(", ")}
            </span>
          )}
          {p.emergency_contact_name && (
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              Emergencia: {p.emergency_contact_name} {p.emergency_contact_phone ? `· ${p.emergency_contact_phone}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Antecedentes */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Antecedentes Médicos</h2>
        <div className="space-y-4">
          {p.allergies && p.allergies.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Alergias</p>
              <div className="flex flex-wrap gap-2">
                {p.allergies.map((a) => <Badge key={a} label={a} variant="red" />)}
              </div>
            </div>
          )}
          {p.chronic_conditions && p.chronic_conditions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Enfermedades crónicas</p>
              <div className="flex flex-wrap gap-2">
                {p.chronic_conditions.map((c) => <Badge key={c} label={c} variant="yellow" />)}
              </div>
            </div>
          )}
          {p.current_medications && p.current_medications.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Medicamentos</p>
              <div className="flex flex-wrap gap-2">
                {p.current_medications.map((m) => <Badge key={m} label={m} variant="blue" />)}
              </div>
            </div>
          )}
          {p.previous_surgeries && p.previous_surgeries.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Cirugías previas</p>
              <div className="flex flex-wrap gap-2">
                {p.previous_surgeries.map((s) => <Badge key={s} label={s} variant="purple" />)}
              </div>
            </div>
          )}
          {!p.allergies?.length && !p.chronic_conditions?.length && !p.current_medications?.length && !p.previous_surgeries?.length && (
            <p className="text-sm text-gray-500">Sin antecedentes registrados.</p>
          )}
        </div>
      </div>

      {/* Notas */}
      {p.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-gray-900">Notas</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.notes}</p>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link
          href={`/agenda/nueva?paciente=${id}`}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50"
        >
          <Calendar className="h-6 w-6 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">Nueva Consulta</span>
        </Link>
      </div>

      {/* Meta */}
      <p className="text-right text-xs text-gray-400">
        Paciente desde {formatDate(p.created_at)}
        {p.referral_source ? ` · Conoció por ${p.referral_source}` : ""}
      </p>
    </div>
  );
}
