"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export const runtime = "edge";

type Template = { id: string; name: string; body: string; created_at: string };

const VARIABLES = [
  "{{nombre_paciente}}", "{{fecha}}", "{{nombre_clinica}}",
  "{{precio}}", "{{procedimiento}}", "{{medico}}",
];

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/configuracion/plantillas");
    const d = await r.json();
    setTemplates(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/configuracion/plantillas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message ?? "Error al guardar");
    } else {
      setForm({ name: "", body: "" });
      await load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/configuracion/plantillas/${id}`, { method: "DELETE" });
    await load();
  }

  function insertVar(v: string) {
    setForm((f) => ({ ...f, body: f.body + v }));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas de Propuestas</h1>
          <p className="text-sm text-gray-500">Textos reutilizables con variables dinámicas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Nueva Plantilla</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ej. Propuesta Cirugía Estética"
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
            rows={8}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Estimado/a {{nombre_paciente}},&#10;&#10;Con gusto le presentamos la propuesta para {{procedimiento}}..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={saving}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Guardando..." : "+ Guardar Plantilla"}
        </button>
      </form>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Plantillas ({templates.length})</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Cargando...</p>
        ) : !templates.length ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Sin plantillas.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {templates.map((t) => (
              <div key={t.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <p className="font-medium text-gray-900">{t.name}</p>
                    {expanded === t.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="ml-4 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expanded === t.id && (
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 font-mono">
                    {t.body}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
