"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const runtime = "edge";

export default function NuevaConsultaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("paciente");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    fetch("/api/pacientes/lista").then((r) => r.json()).then(setPatients).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setLoading(false);
      return;
    }
    router.push("/agenda");
  }

  const now = new Date();
  const defaultStart = now.toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const field = "field";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/agenda" className="text-[#797588] hover:text-[#484556]"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-[#151c27]">Nueva Consulta</h1>
      </div>

      <form onSubmit={handleSubmit} className="card card-p space-y-4">
        <div>
          <label htmlFor="patient_id" className="label">Paciente *</label>
          <select id="patient_id" name="patient_id" required defaultValue={pacienteId ?? ""} className={field}>
            <option value="">— Seleccionar paciente —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="label">Título *</label>
          <input id="title" name="title" required placeholder="ej. Consulta inicial, Evaluación postoperatoria..." className={field} />
        </div>

        <div>
          <label htmlFor="type" className="label">Tipo</label>
          <select id="type" name="type" className={field}>
            <option value="consultation">Consulta</option>
            <option value="follow_up">Seguimiento</option>
            <option value="surgery">Cirugía</option>
            <option value="procedure">Procedimiento</option>
            <option value="evaluation">Evaluación</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="starts_at" className="label">Inicio *</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={defaultStart} className={field} />
          </div>
          <div>
            <label htmlFor="ends_at" className="label">Fin *</label>
            <input id="ends_at" name="ends_at" type="datetime-local" required defaultValue={defaultEnd} className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="label">Notas</label>
          <textarea id="notes" name="notes" rows={3} placeholder="Observaciones adicionales..." className={field} />
        </div>

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 pt-2">
          <Link href="/agenda" className="btn-secondary flex-1 text-center">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
