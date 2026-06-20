"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { CheckCircle, FileText, AlertCircle } from "lucide-react";

type Proposal = {
  id: string;
  title: string;
  body: string;
  total_price: number | null;
  discount: number | null;
  final_price: number | null;
  valid_until: string | null;
  status: string;
  payment_notes: string | null;
  patients: { full_name: string } | null;
};

function formatPrice(n: number | null) {
  if (n == null) return null;
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<"view" | "sign" | "done">("view");
  const [signerName, setSignerName] = useState("");
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setProposal(d);
          if (d.status === "signed") setStep("done");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!signerName.trim()) { setError("Por favor escribe tu nombre completo"); return; }
    setSigning(true);
    setError("");

    const res = await fetch(`/api/portal/${token}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signer_name: signerName }),
    });

    if (res.ok) {
      setStep("done");
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al firmar");
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Cargando propuesta...</p>
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Propuesta no encontrada</h1>
        <p className="mt-2 text-sm text-gray-500">El enlace puede haber expirado o ser incorrecto.</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="rounded-full bg-green-100 p-4 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">¡Propuesta firmada!</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-xs">
          {proposal.patients?.full_name && `Gracias, ${proposal.patients.full_name}. `}
          Tu firma ha sido registrada exitosamente.
        </p>
      </div>
    );
  }

  const price = proposal.final_price ?? proposal.total_price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Propuesta comercial</p>
            <h1 className="font-semibold text-gray-900">{proposal.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-4 space-y-4 pb-32">
        {proposal.patients && (
          <p className="text-sm text-gray-500">Para: <span className="font-medium text-gray-700">{proposal.patients.full_name}</span></p>
        )}

        {/* Precio */}
        {price != null && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Inversión total</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(price)}</p>
            {proposal.discount != null && proposal.discount > 0 && (
              <p className="text-sm text-green-600 mt-1">Incluye descuento de {formatPrice(proposal.discount)}</p>
            )}
            {proposal.payment_notes && (
              <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">{proposal.payment_notes}</p>
            )}
          </div>
        )}

        {/* Contenido */}
        {proposal.body && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Detalle</p>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{proposal.body}</div>
          </div>
        )}

        {proposal.valid_until && (
          <p className="text-center text-xs text-gray-400">Válida hasta el {formatDate(proposal.valid_until)}</p>
        )}
      </div>

      {/* Sticky footer — firma */}
      {step === "view" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="mx-auto max-w-2xl">
            <button onClick={() => setStep("sign")}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700">
              Firmar propuesta →
            </button>
          </div>
        </div>
      )}

      {step === "sign" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="mx-auto max-w-2xl space-y-3">
            <p className="text-sm font-medium text-gray-700 text-center">Escribe tu nombre completo para firmar</p>
            <input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep("view")}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button onClick={handleSign} disabled={signing}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {signing ? "Firmando..." : "Confirmar firma"}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Al firmar, aceptas los términos de esta propuesta. Se registrará tu nombre, fecha, hora e IP.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
