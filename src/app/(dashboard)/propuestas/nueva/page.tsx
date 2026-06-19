"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const runtime = "edge";

export default function NuevaPropuestaPage() {
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
    const res = await fetch("/api/propuestas", {
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

    const prop = await res.json();
    router.push(`/propuestas/${prop.id}`);
  }

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/propuestas" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Propuesta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
          <select id="patient_id" name="patient_id" required defaultValue={pacienteId ?? ""} className={field}>
            <option value="">— Seleccionar paciente —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input id="title" name="title" required placeholder="ej. Rinoplastia + Blefaroplastia" className={field} />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Descripción / Detalle *</label>
          <textarea id="body" name="body" required rows={6}
            placeholder="Describe los procedimientos, condiciones, qué incluye y excluye..." className={field} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" className={field} />
          </div>
          <div>
            <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">Válida hasta</label>
            <input id="expires_at" name="expires_at" type="date" className={field} />
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 pt-2">
          <Link href="/propuestas"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar Propuesta"}
          </button>
        </div>
      </form>
    </div>
  );
}
