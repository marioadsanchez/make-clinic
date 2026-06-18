"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const runtime = "edge";

const VARIABLES = [
  "{{nombre_paciente}}", "{{fecha}}", "{{nombre_clinica}}",
  "{{procedimiento}}", "{{medico}}",
];

export default function NuevoDocumentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("paciente");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string; body: string }[]>([]);
  const [form, setForm] = useState({ patient_id: pacienteId ?? "", name: "", body: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/pacientes/lista").then((r) => r.json()),
      fetch("/api/configuracion/plantillas-documento").then((r) => r.json()),
    ]).then(([p, t]) => { setPatients(p); setTemplates(t); }).catch(() => {});
  }, []);

  function applyTemplate(templateId: string) {
    const t = templates.find((t) => t.id === templateId);
    if (t) setForm((f) => ({ ...f, body: t.body }));
  }

  function insertVar(v: string) {
    setForm((f) => ({ ...f, body: f.body + v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message ?? "Error al guardar");
      setLoading(false);
      return;
    }

    const doc = await res.json();
    router.push(`/documentos/${doc.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/documentos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Documento</h1>
          <p className="text-sm text-gray-500">Consentimiento o documento clínico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paciente <span className="text-red-500">*</span>
          </label>
          <select
            required
            title="Paciente"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">— Seleccionar paciente —</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {templates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usar plantilla</label>
            <select
              title="Plantilla"
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">— Seleccionar plantilla —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del documento <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ej. Consentimiento Informado Rinoplastia"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Contenido <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {VARIABLES.map((v) => (
              <button key={v} type="button" onClick={() => insertVar(v)}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-blue-100 hover:text-blue-700">
                {v}
              </button>
            ))}
          </div>
          <textarea
            required
            rows={12}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Yo, {{nombre_paciente}}, declaro haber sido informado/a sobre..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 pt-2">
          <Link href="/documentos"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar Documento"}
          </button>
        </div>
      </form>
    </div>
  );
}
