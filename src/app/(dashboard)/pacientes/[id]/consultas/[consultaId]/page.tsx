import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export const runtime = "edge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

type Params = { id: string; consultaId: string };

export default async function ConsultaPage({ params }: { params: Promise<Params> }) {
  const { id, consultaId } = await params;
  const supabase = createAdminClient();

  const [{ data: consulta }, { data: patient }] = await Promise.all([
    supabase.from("consultations").select("*").eq("id", consultaId).single(),
    supabase.from("patients").select("id, full_name").eq("id", id).single(),
  ]);

  if (!consulta) notFound();

  const sections = [
    { label: "Motivo de consulta",        value: consulta.chief_complaint },
    { label: "Anamnesis / Historia actual", value: consulta.history },
    { label: "Examen físico",              value: consulta.physical_exam },
    { label: "Diagnóstico",               value: consulta.diagnosis },
    { label: "Plan de tratamiento",        value: consulta.treatment_plan },
    { label: "Notas adicionales",          value: consulta.notes },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Link href={`/pacientes/${id}`} className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Consulta Clínica</h1>
          <p className="text-sm text-gray-500 capitalize">{formatDate(consulta.date)}</p>
          {patient && (
            <Link href={`/pacientes/${id}`} className="text-sm text-blue-600 hover:underline">
              {patient.full_name}
            </Link>
          )}
        </div>
        <Link href={`/pacientes/${id}/consultas/${consultaId}/editar`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Link>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Esta consulta no tiene contenido registrado.</p>
          <Link href={`/pacientes/${id}/consultas/${consultaId}/editar`}
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            Agregar información →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{s.label}</p>
              <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/pacientes/${id}/consultas/nueva`}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          + Nueva Consulta
        </Link>
        <Link href={`/propuestas/nueva?paciente=${id}`}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
          Generar Propuesta
        </Link>
      </div>
    </div>
  );
}
