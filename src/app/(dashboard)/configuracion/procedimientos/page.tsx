"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Procedure } from "@/lib/types";

export const runtime = "edge";

export default function ProcedimientosPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", base_price: "", estimated_duration_minutes: "", is_surgical: false,
  });

  async function load() {
    const r = await fetch("/api/configuracion/procedimientos");
    const d = await r.json();
    setProcedures(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/configuracion/procedimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message ?? "Error al guardar");
    } else {
      setForm({ name: "", description: "", base_price: "", estimated_duration_minutes: "", is_surgical: false });
      await load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/configuracion/procedimientos/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procedimientos</h1>
          <p className="text-sm text-gray-500">Catálogo de procedimientos</p>
        </div>
      </div>

      {/* Formulario nuevo */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Agregar Procedimiento</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ej. Rinoplastia, Liposucción..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio base (MXN)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
            <input
              type="number"
              min="0"
              value={form.estimated_duration_minutes}
              onChange={(e) => setForm({ ...form, estimated_duration_minutes: e.target.value })}
              placeholder="60"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_surgical}
            onChange={(e) => setForm({ ...form, is_surgical: e.target.checked })}
            className="rounded border-gray-300"
          />
          Es procedimiento quirúrgico
        </label>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={saving}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Guardando..." : "+ Agregar Procedimiento"}
        </button>
      </form>

      {/* Lista */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Procedimientos ({procedures.length})</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Cargando...</p>
        ) : !procedures.length ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">Sin procedimientos registrados.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {procedures.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.is_surgical && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Quirúrgico
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {p.base_price ? `$${p.base_price.toLocaleString("es-MX")} MXN` : "Sin precio"}
                    {p.estimated_duration_minutes ? ` · ${p.estimated_duration_minutes} min` : ""}
                  </p>
                  {p.description && <p className="mt-1 text-xs text-gray-400">{p.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
