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

  const f = "field";
  const l = "label";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/controles" className="text-[#797588] hover:text-[#484556]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#151c27]">Nuevo Control</h1>
      </div>

      <form onSubmit={handleSubmit} className="card card-p space-y-4">
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
          <Link href="/controles" className="btn-secondary flex-1 text-center">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? "Guardando..." : "Crear Control"}
          </button>
        </div>
      </form>
    </div>
  );
}
