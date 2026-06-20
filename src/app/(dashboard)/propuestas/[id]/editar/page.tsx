"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

export default function EditarPropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/propuestas/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTitle(d.title ?? "");
        setBody(d.body ?? "");
        setTotalPrice(d.total_price != null ? String(d.total_price) : "");
        setDiscount(d.discount != null && d.discount !== 0 ? String(d.discount) : "");
        setValidUntil(d.valid_until?.slice(0, 10) ?? "");
        setPaymentNotes(d.payment_notes ?? "");
        setNotes(d.notes ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/propuestas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, total_price: totalPrice, discount, valid_until: validUntil, payment_notes: paymentNotes, notes }),
    });

    if (res.ok) {
      router.push(`/propuestas/${id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const totalNum = parseFloat(totalPrice) || 0;
  const discountNum = parseFloat(discount) || 0;
  const finalPrice = totalNum - discountNum;

  const f = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const l = "mb-1 block text-sm font-medium text-gray-700";

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-500">Cargando...</p></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/propuestas/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Propuesta</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label className={l}>Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={f} />
          </div>
          <div>
            <label className={l}>Contenido / Descripción</label>
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="Descripción de los procedimientos, condiciones, términos..." className={f} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Precio</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={l}>Precio total</label>
              <input type="number" step="0.01" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="0.00" className={f} />
            </div>
            <div>
              <label className={l}>Descuento</label>
              <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00" className={f} />
            </div>
          </div>
          {totalNum > 0 && (
            <div className="rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-800">
                Precio final: <span className="font-bold">${finalPrice.toLocaleString("es-MX")}</span>
              </p>
            </div>
          )}
          <div>
            <label className={l}>Válida hasta</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={f} />
          </div>
          <div>
            <label className={l}>Condiciones de pago</label>
            <textarea rows={2} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Ej: 50% anticipo, resto el día de la cirugía..." className={f} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className={l}>Notas internas</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones internas (no visibles para el paciente)..." className={f} />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href={`/propuestas/${id}`}
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
