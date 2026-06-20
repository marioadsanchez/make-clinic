"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Patient = { id: string; full_name: string };

export default function NuevoControlPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/pacientes/lista").then((r) => r.json()).then(setPatients);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/controles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    if (res.ok) {
      router.push("/controles");
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const f = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const l = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/controles" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Control</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className={l}>Paciente *</label>
          <select name="patient_id" required className={f}>
            <option value="">Seleccionar paciente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={l}>Título / Tipo de control *</label>
          <input name="title" required placeholder="Ej: Control post-op 1 mes, Revisión de suturas..." className={f} />
        </div>

        <div>
          <label className={l}>Fecha programada</label>
          <input name="due_date" type="date" defaultValue={defaultDate} className={f} />
        </div>

        <div>
          <label className={l}>Notas</label>
          <textarea name="notes" rows={3} placeholder="Instrucciones o recordatorios..." className={f} />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href="/controles"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Crear Control"}
          </button>
        </div>
      </form>
    </div>
  );
}
