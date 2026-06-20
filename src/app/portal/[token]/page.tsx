"use client";

import { useState, useEffect, use } from "react";
import {
  CheckCircle, ShieldCheck, FileText, Clock, RefreshCw,
  Package, CreditCard, FolderOpen, Lightbulb, Download,
  Lock, AlertCircle, Loader2,
} from "lucide-react";

type Proposal = {
  id: string;
  title: string;
  body: string | null;
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
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function firstName(name: string | null | undefined) {
  return name?.split(" ")[0] ?? "Paciente";
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-[#5427e6]/10 flex items-center justify-center text-[#5427e6] shrink-0">
      {children}
    </div>
  );
}

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [step, setStep] = useState<"view" | "sign">("view");
  const [signError, setSignError] = useState("");

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setProposal(d);
          if (d.status === "signed" || d.status === "approved") setApproved(true);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleApprove() {
    if (!signerName.trim()) { setSignError("Por favor escribe tu nombre completo"); return; }
    setApproving(true);
    setSignError("");
    const res = await fetch(`/api/portal/${token}/assinar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signer_name: signerName }),
    });
    if (res.ok) {
      setApproved(true);
      setShowSuccess(true);
    } else {
      const err = await res.json();
      setSignError(err.error ?? "Error al firmar");
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff]">
        <Loader2 className="w-8 h-8 text-[#5427e6] animate-spin" />
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9ff] p-6 text-center">
        <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
        <h1 className="text-[24px] font-semibold text-[#151c27]">Propuesta no encontrada</h1>
        <p className="mt-2 text-[16px] text-[#484556]">El enlace puede haber expirado o ser incorrecto.</p>
      </div>
    );
  }

  const price = proposal.final_price ?? proposal.total_price;
  const patientName = proposal.patients?.full_name ?? null;
  const taxBase = price != null ? price / 1.21 : null;
  const tax = price != null && taxBase != null ? price - taxBase : null;

  return (
    <div className="bg-[#f9f9ff] min-h-screen text-[#151c27]">
      <main className="max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row relative">

        {/* ── LEFT: Main content ── */}
        <div className="flex-1 w-full lg:max-w-4xl pb-40 md:pb-12">

          {/* Hero */}
          <div className="relative h-[360px] md:h-[460px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b0fa0] via-[#5427e6] to-[#1a0054]" />
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 70% 40%, #6d4aff 0%, transparent 60%)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9ff] via-[#f9f9ff]/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[14px] font-medium">Propuesta Personalizada</span>
              </div>
              <h1 className="text-[40px] md:text-[56px] font-bold text-[#151c27] leading-tight tracking-tight">
                Hola, {firstName(patientName)}
              </h1>
              <p className="text-[18px] text-[#484556] max-w-lg mt-2 leading-relaxed">
                Hemos diseñado un plan exclusivo para resaltar tu belleza natural con la precisión que mereces.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="px-8 md:px-12 space-y-14 mt-10">

            {/* Procedimiento propuesto */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon><FileText className="w-5 h-5" /></SectionIcon>
                <h2 className="text-[24px] font-semibold tracking-tight">Procedimiento propuesto</h2>
              </div>
              <div className="bg-white border border-[#c9c4d9] rounded-2xl p-6 shadow-sm">
                <h3 className="text-[20px] font-semibold text-[#5427e6] mb-2">{proposal.title}</h3>
                <p className="text-[16px] text-[#484556] leading-relaxed whitespace-pre-wrap">
                  {proposal.body ?? `Tratamiento diseñado específicamente para ${patientName ?? "el paciente"}.`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f9f9ff]">
                    <Clock className="w-5 h-5 text-[#5427e6] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[14px] font-medium text-[#797588]">Validez de la propuesta</p>
                      <p className="text-[16px] font-semibold">{formatDate(proposal.valid_until) ?? "A consultar"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#f9f9ff]">
                    <RefreshCw className="w-5 h-5 text-[#5427e6] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[14px] font-medium text-[#797588]">Seguimiento</p>
                      <p className="text-[16px] font-semibold">Control incluido</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Qué incluye */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon><Package className="w-5 h-5" /></SectionIcon>
                <h2 className="text-[24px] font-semibold tracking-tight">Qué incluye el programa</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Consulta pre-procedimiento",
                  "Materiales e insumos incluidos",
                  "Kit de cuidados post-tratamiento",
                  "Revisión de control programada",
                ].map((item) => (
                  <div key={item}
                    className="flex items-center gap-4 p-4 border border-[#c9c4d9] rounded-xl hover:border-[#5427e6]/40 transition-colors bg-white">
                    <CheckCircle className="w-5 h-5 text-[#5427e6] shrink-0" />
                    <span className="text-[16px] text-[#151c27]">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Inversión */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon><CreditCard className="w-5 h-5" /></SectionIcon>
                <h2 className="text-[24px] font-semibold tracking-tight">Inversión</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#5427e6] text-white rounded-2xl p-8 flex flex-col justify-between shadow-lg shadow-[#5427e6]/20">
                  <div>
                    <p className="text-[12px] font-medium text-white/80 uppercase tracking-wider mb-2">
                      Total del Tratamiento
                    </p>
                    <p className="text-[44px] font-bold leading-none">
                      {formatPrice(price) ?? "A consultar"}
                    </p>
                    {proposal.discount != null && proposal.discount > 0 && (
                      <p className="text-[14px] text-white/70 mt-2">
                        Descuento incluido: {formatPrice(proposal.discount)}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/15">
                    <p className="text-[14px] text-white/70 italic">
                      {proposal.valid_until
                        ? `* Válido hasta el ${formatDate(proposal.valid_until)}.`
                        : "* Consulte vigencia con su médico."}
                    </p>
                  </div>
                </div>
                <div className="bg-[#f0f3ff] border border-[#c9c4d9] rounded-2xl p-8">
                  <p className="text-[12px] font-medium text-[#797588] uppercase tracking-wider mb-5">
                    Opciones de pago
                  </p>
                  {proposal.payment_notes ? (
                    <p className="text-[16px] text-[#151c27] leading-relaxed whitespace-pre-wrap">
                      {proposal.payment_notes}
                    </p>
                  ) : price != null ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-[#c9c4d9]/40">
                        <span className="text-[16px] text-[#484556]">Pago único</span>
                        <span className="text-[16px] font-bold text-[#5427e6]">{formatPrice(price)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-[#c9c4d9]/40">
                        <span className="text-[16px] text-[#484556]">3 cuotas s/interés</span>
                        <span className="text-[16px] font-bold text-[#5427e6]">
                          {formatPrice(price / 3)}/mes
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[16px] text-[#484556]">Financiación</span>
                        <span className="text-[16px] text-[#797588] italic">A consultar</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[16px] text-[#484556]">Consulte las opciones de pago con su médico.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Documentos */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon><FolderOpen className="w-5 h-5" /></SectionIcon>
                <h2 className="text-[24px] font-semibold tracking-tight">Documentos incluidos</h2>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  "Consentimiento informado del procedimiento",
                  "Guía de cuidados pre y post tratamiento",
                ].map((doc) => (
                  <div key={doc}
                    className="flex items-center justify-between p-4 bg-white border border-[#c9c4d9] rounded-xl group cursor-pointer hover:bg-[#e7eefe] transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#797588]" />
                      <span className="text-[16px] text-[#151c27]">{doc}.pdf</span>
                    </div>
                    <Download className="w-5 h-5 text-[#5427e6] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </section>

            {/* Observaciones */}
            <section className="pb-8">
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon><Lightbulb className="w-5 h-5" /></SectionIcon>
                <h2 className="text-[24px] font-semibold tracking-tight">Observaciones</h2>
              </div>
              <div className="p-6 bg-[#e7eefe]/40 rounded-2xl border border-[#c9c4d9] border-dashed">
                <p className="text-[16px] text-[#484556] leading-relaxed italic">
                  "Esta propuesta ha sido diseñada específicamente para{" "}
                  {patientName ?? "el paciente"} considerando su historial clínico y objetivos estéticos.
                  Para cualquier consulta, contáctenos directamente."
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <aside className="fixed bottom-0 left-0 right-0 md:sticky md:top-8 md:self-start w-full md:w-[380px] p-4 md:p-8 z-50">
          <div className="bg-white/85 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-2xl md:shadow-xl flex flex-col gap-6">

            {/* Summary — desktop only */}
            <div className="hidden md:block">
              <h4 className="text-[20px] font-semibold mb-1">Resumen de Propuesta</h4>
              <p className="text-[14px] text-[#797588] mb-6 pb-6 border-b border-[#c9c4d9]/40 truncate">
                {proposal.title}
              </p>
              <div className="space-y-3 mb-8">
                {taxBase != null && (
                  <div className="flex justify-between text-[#484556]">
                    <span className="text-[14px]">Subtotal</span>
                    <span className="text-[14px]">{formatPrice(taxBase)}</span>
                  </div>
                )}
                {tax != null && (
                  <div className="flex justify-between text-[#484556]">
                    <span className="text-[14px]">IVA (21%)</span>
                    <span className="text-[14px]">{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5427e6] font-bold pt-3 border-t border-[#c9c4d9]/40">
                  <span className="text-[20px] font-semibold">Total</span>
                  <span className="text-[20px] font-semibold">{formatPrice(price) ?? "—"}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {approved ? (
              <div className="flex flex-col items-center text-center gap-2 py-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-1">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-[16px] font-semibold text-[#151c27]">Propuesta aprobada</p>
                <p className="text-[14px] text-[#797588]">Nos pondremos en contacto contigo pronto.</p>
              </div>
            ) : step === "view" ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setStep("sign")}
                  className="w-full bg-[#5427e6] text-white py-4 rounded-2xl font-bold text-[16px] hover:bg-[#6d4aff] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#5427e6]/20">
                  <CheckCircle className="w-5 h-5" />
                  Aprobar propuesta
                </button>
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-white text-[#484556] py-3 border border-[#c9c4d9] rounded-2xl text-[14px] font-medium hover:bg-[#f0f3ff] transition-all flex items-center justify-center gap-2"
                    title="Descargar PDF">
                    <Download className="w-4 h-4" /> Descargar PDF
                  </button>
                  <button
                    className="flex-1 bg-white text-[#484556] py-3 border border-[#c9c4d9] rounded-2xl text-[14px] font-medium hover:bg-[#f0f3ff] transition-all flex items-center justify-center gap-2"
                    title="Contactar clínica">
                    <FileText className="w-4 h-4" /> Contactar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[14px] font-medium text-center text-[#151c27]">
                  Escribe tu nombre completo para aprobar
                </p>
                <input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApprove(); }}
                  placeholder="Nombre completo"
                  autoFocus
                  className="w-full rounded-xl border border-[#c9c4d9] px-4 py-3 text-[#151c27] placeholder-[#797588] focus:border-[#5427e6] focus:outline-none focus:ring-2 focus:ring-[#5427e6]/20"
                />
                {signError && <p className="text-[12px] text-red-500 text-center">{signError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("view")}
                    className="flex-1 rounded-xl border border-[#c9c4d9] py-3 text-[14px] font-medium text-[#484556] hover:bg-[#f0f3ff] transition-all">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 rounded-xl bg-[#5427e6] py-3 text-[14px] font-semibold text-white disabled:opacity-50 hover:bg-[#6d4aff] transition-all">
                    {approving ? "Procesando..." : "Confirmar"}
                  </button>
                </div>
                <p className="text-[11px] text-[#797588] text-center">
                  Al aprobar, aceptas los términos de esta propuesta. Se registrarán tu nombre, fecha, hora e IP.
                </p>
              </div>
            )}

            {!approved && step === "view" && (
              <div className="hidden md:flex items-center justify-center gap-2 text-[12px] text-[#797588] opacity-60">
                <Lock className="w-3.5 h-3.5" />
                <span>Aprobación segura y encriptada</span>
              </div>
            )}
          </div>
        </aside>

      </main>

      {/* ── Success Overlay ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-[#151c27]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#5427e6]/10 text-[#5427e6] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <h3 className="text-[28px] font-bold text-[#151c27] mb-3">
              ¡Excelente, {firstName(patientName)}!
            </h3>
            <p className="text-[16px] text-[#484556] mb-8 leading-relaxed">
              Tu propuesta ha sido aprobada. En breve recibirás confirmación y el enlace para agendar tu cita.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-[#5427e6] text-white py-4 rounded-2xl font-bold text-[16px] hover:bg-[#6d4aff] transition-all">
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
