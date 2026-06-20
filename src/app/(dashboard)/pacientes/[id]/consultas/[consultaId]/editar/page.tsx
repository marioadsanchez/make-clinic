"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

type Params = { id: string; consultaId: string };

export default function EditarConsultaPage({ params }: { params: Promise<Params> }) {
  const { id, consultaId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/pacientes/${id}/consultas/${consultaId}`)
      .then((r) => r.json())
      .then((data) => {
        setDate(data.date ? data.date.slice(0, 16) : "");
        setChiefComplaint(data.chief_complaint ?? "");
        setHistory(data.history ?? "");
        setPhysicalExam(data.physical_exam ?? "");
        setDiagnosis(data.diagnosis ?? "");
        setTreatmentPlan(data.treatment_plan ?? "");
        setNotes(data.notes ?? "");
      })
      .finally(() => setLoading(false));
  }, [id, consultaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/pacientes/${id}/consultas/${consultaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date, chief_complaint: chiefComplaint, history, physical_exam: physicalExam,
        diagnosis, treatment_plan: treatmentPlan, notes,
      }),
    });

    if (res.ok) {
      router.push(`/pacientes/${id}/consultas/${consultaId}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const lbl = "mb-1 block text-sm font-medium text-gray-700";

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-500">Cargando...</p></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}/consultas/${consultaId}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label htmlFor="date" className={lbl}>Fecha y hora</label>
            <input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="chief_complaint" className={lbl}>Motivo de consulta</label>
            <textarea id="chief_complaint" rows={2} value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="¿Por qué viene el paciente hoy?" className={field} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Evaluación</h2>
          <div>
            <label htmlFor="history" className={lbl}>Anamnesis / Historia actual</label>
            <textarea id="history" rows={3} value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="Descripción de la situación actual..." className={field} />
          </div>
          <div>
            <label htmlFor="physical_exam" className={lbl}>Examen físico</label>
            <textarea id="physical_exam" rows={3} value={physicalExam}
              onChange={(e) => setPhysicalExam(e.target.value)}
              placeholder="Hallazgos del examen físico..." className={field} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Conclusión</h2>
          <div>
            <label htmlFor="diagnosis" className={lbl}>Diagnóstico</label>
            <textarea id="diagnosis" rows={2} value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Diagnóstico principal y secundarios..." className={field} />
          </div>
          <div>
            <label htmlFor="treatment_plan" className={lbl}>Plan de tratamiento</label>
            <textarea id="treatment_plan" rows={3} value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Indicaciones, procedimientos, medicamentos..." className={field} />
          </div>
          <div>
            <label htmlFor="notes" className={lbl}>Notas adicionales</label>
            <textarea id="notes" rows={2} value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones internas..." className={field} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href={`/pacientes/${id}/consultas/${consultaId}`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
