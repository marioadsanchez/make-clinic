"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

export default function NuevaConsultaClinicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/pacientes/${id}/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/pacientes/${id}/consultas/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const lbl = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label htmlFor="date" className={lbl}>Fecha y hora</label>
            <input id="date" name="date" type="datetime-local" defaultValue={defaultDate} className={field} />
          </div>

          <div>
            <label htmlFor="chief_complaint" className={lbl}>Motivo de consulta</label>
            <textarea id="chief_complaint" name="chief_complaint" rows={2}
              placeholder="¿Por qué viene el paciente hoy?" className={field} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Evaluación</h2>

          <div>
            <label htmlFor="history" className={lbl}>Anamnesis / Historia actual</label>
            <textarea id="history" name="history" rows={3}
              placeholder="Descripción de la enfermedad o situación actual..." className={field} />
          </div>

          <div>
            <label htmlFor="physical_exam" className={lbl}>Examen físico</label>
            <textarea id="physical_exam" name="physical_exam" rows={3}
              placeholder="Hallazgos del examen físico..." className={field} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Conclusión</h2>

          <div>
            <label htmlFor="diagnosis" className={lbl}>Diagnóstico</label>
            <textarea id="diagnosis" name="diagnosis" rows={2}
              placeholder="Diagnóstico principal y secundarios..." className={field} />
          </div>

          <div>
            <label htmlFor="treatment_plan" className={lbl}>Plan de tratamiento</label>
            <textarea id="treatment_plan" name="treatment_plan" rows={3}
              placeholder="Indicaciones, procedimientos a realizar, medicamentos, seguimiento..." className={field} />
          </div>

          <div>
            <label htmlFor="notes" className={lbl}>Notas adicionales</label>
            <textarea id="notes" name="notes" rows={2}
              placeholder="Observaciones internas, recordatorios..." className={field} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href={`/pacientes/${id}`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar Consulta"}
          </button>
        </div>
      </form>
    </div>
  );
}
