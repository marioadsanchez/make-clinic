"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

export default function EditarDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch(`/api/documentos/${id}`)
      .then((r) => r.json())
      .then((d) => { setTitle(d.title ?? ""); setBody(d.body ?? ""); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/documentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });

    if (res.ok) {
      router.push(`/documentos/${id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const f = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const l = "mb-1 block text-sm font-medium text-gray-700";

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-500">Cargando...</p></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/documentos/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Documento</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className={l}>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className={f} />
        </div>
        <div>
          <label className={l}>Contenido</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={18}
            className={`${f} font-mono text-xs`} />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href={`/documentos/${id}`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
