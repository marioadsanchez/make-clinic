"use client";

import { useState } from "react";
import { Send, Copy, Check } from "lucide-react";

export function EnviarButton({ proposalId, publicToken, patientPhone }: {
  proposalId: string;
  publicToken: string | null;
  patientPhone?: string | null;
}) {
  const [token, setToken] = useState<string | null>(publicToken);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const portalUrl = token ? `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${token}` : null;

  async function handleEnviar() {
    setSending(true);
    const res = await fetch(`/api/propuestas/${proposalId}/enviar`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
    }
    setSending(false);
  }

  async function handleCopy() {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!token) {
    return (
      <button onClick={handleEnviar} disabled={sending}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        <Send className="h-4 w-4" />
        {sending ? "Generando enlace..." : "Enviar para firma"}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
      <p className="text-sm font-medium text-blue-800">Enlace de firma generado</p>
      <div className="flex gap-2">
        <input readOnly value={portalUrl ?? ""} className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-gray-700" />
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      {patientPhone && (
        <a href={`https://wa.me/${patientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, te comparto el enlace para firmar tu propuesta: ${portalUrl}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 w-full justify-center">
          💬 Enviar por WhatsApp
        </a>
      )}
    </div>
  );
}
