"use client";

import { useState, useEffect, useRef, use } from "react";
import { ShieldCheck, Download, HelpCircle, CheckCircle, Pen, Loader2 } from "lucide-react";

type Doc = {
  id: string;
  title: string;
  body: string | null;
  created_at: string | null;
  patients: { full_name: string; email: string | null } | null;
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function FirmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetch(`/api/documentos/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => d && setDoc(d))
      .finally(() => setLoading(false));
  }, [id]);

  // Resize canvas to its display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.MouseEvent | React.TouchEvent) {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  }

  function onPointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#151c27";
    ctx.beginPath();
    if (lastPos.current) ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasSigned) setHasSigned(true);
  }

  function onPointerUp() {
    isDrawing.current = false;
    lastPos.current = null;
  }

  function clearPad() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  async function handleSign() {
    if (!accepted || !hasSigned) return;
    setSigning(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSigning(false);
    setDone(true);
  }

  // ── States ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#5427e6] animate-spin" />
      </div>
    );
  }

  if (notFound || !doc) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-[20px] font-semibold text-[#151c27]">Documento no encontrado</p>
        <p className="text-[16px] text-[#484556] mt-2">El enlace puede haber expirado o ser incorrecto.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center gap-6 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
          </div>
          <h1 className="text-[24px] font-semibold text-[#151c27]">¡Documento Firmado!</h1>
          <p className="text-[16px] text-[#484556] leading-relaxed">
            Su consentimiento ha sido registrado con éxito.
            {doc.patients?.email && (
              <> Se ha enviado una copia a <strong>{doc.patients.email}</strong>.</>
            )}
          </p>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="w-full h-12 bg-[#5427e6] text-white rounded-xl text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
            Cerrar ventana
          </button>
        </div>
      </div>
    );
  }

  const patient = doc.patients;
  const canSubmit = accepted && hasSigned && !signing;

  return (
    <div className="bg-[#f9f9ff] min-h-screen flex flex-col items-center">

      {/* Focused header */}
      <header className="w-full h-16 bg-white border-b border-[#c9c4d9] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#5427e6]" strokeWidth={2} />
          <span className="text-[20px] font-semibold text-[#151c27]">Firma de documento</span>
        </div>
        <button type="button" className="p-2 rounded-full hover:bg-[#f0f3ff] transition-colors text-[#797588]" title="Ayuda">
          <HelpCircle className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-4xl px-4 py-8 md:py-12 flex flex-col gap-8">

        {/* Document progress header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-[#151c27]">{doc.title}</h1>
            <span className="px-3 py-1 bg-[#e5deff] text-[#4500d8] text-[14px] font-medium rounded-full">Pendiente</span>
          </div>
          <p className="text-[16px] text-[#484556]">
            Por favor, revise los términos cuidadosamente antes de proceder con la firma digital.
          </p>
        </div>

        {/* Bento grid: metadata + PDF viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Metadata */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-xl border border-[#c9c4d9] flex flex-col gap-5">
              <h3 className="text-[20px] font-semibold text-[#151c27] border-b border-[#c9c4d9] pb-3">Información</h3>

              {patient && (
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-medium text-[#797588]">Paciente</span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] font-bold text-[14px] shrink-0">
                      {initials(patient.full_name)}
                    </div>
                    <span className="text-[16px] font-semibold text-[#151c27]">{patient.full_name}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#797588]">Documento</span>
                <span className="text-[14px] text-[#151c27]">{doc.title}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#797588]">Fecha de emisión</span>
                <span className="text-[14px] text-[#151c27]">{formatDate(doc.created_at)}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#797588]">ID de documento</span>
                <span className="text-[12px] text-[#797588] font-mono">{doc.id.slice(0, 18).toUpperCase()}</span>
              </div>
            </div>

            {/* Security notice */}
            <div className="bg-[#f0f3ff] p-4 rounded-xl border border-[#5427e6]/20 flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-[#5427e6] shrink-0 mt-0.5" />
              <p className="text-[14px] text-[#484556] leading-relaxed">
                Este proceso de firma cumple con las normativas legales de seguridad digital y encriptación de datos sensibles de salud.
              </p>
            </div>
          </div>

          {/* RIGHT: PDF viewer */}
          <div className="lg:col-span-2">
            <div className="bg-[#525659] p-4 md:p-8 rounded-xl min-h-[520px] flex flex-col items-center overflow-y-auto max-h-[680px] shadow-lg">
              {/* Page 1 */}
              <div className="bg-white w-full max-w-2xl p-10 md:p-14 mb-6 flex flex-col gap-5 relative shadow-md">
                <div className="absolute top-6 right-6 text-[#c9c4d9] text-[12px]">Pág. 1 / 2</div>
                <div className="flex justify-center mb-2">
                  <div className="text-[#5427e6] font-bold text-[20px] uppercase tracking-widest border-b-2 border-[#5427e6] pb-1">
                    CLÍNICA MAKE
                  </div>
                </div>
                <h2 className="text-center text-[24px] font-semibold tracking-[-0.01em] text-[#151c27] mb-2">
                  {doc.title.toUpperCase()}
                </h2>
                <div className="space-y-4 text-[14px] text-[#484556] text-justify leading-relaxed">
                  {doc.body ? (
                    <p className="whitespace-pre-wrap">{doc.body}</p>
                  ) : (
                    <>
                      <p>
                        {patient
                          ? `Yo, <strong>${patient.full_name}</strong>, mayor de edad, con plena capacidad jurídica, declaro que he sido informado/a de manera clara y detallada sobre el procedimiento al que me someteré.`
                          : "El/La paciente declara haber sido informado/a de manera clara sobre el procedimiento."}
                      </p>
                      <p>Se me han explicado los objetivos del tratamiento, así como los posibles riesgos, efectos secundarios y las alternativas disponibles. Entiendo que los resultados pueden variar según las condiciones individuales de cada paciente.</p>
                      <p>Autorizo al equipo médico de <strong>Clínica Make</strong> a realizar las intervenciones necesarias siguiendo los protocolos de seguridad establecidos. He tenido la oportunidad de realizar todas las preguntas necesarias y mis dudas han sido resueltas a satisfacción.</p>
                      <p>Asimismo, me comprometo a seguir rigurosamente todas las indicaciones post-tratamiento proporcionadas por el especialista para garantizar la efectividad del procedimiento y mi pronta recuperación.</p>
                    </>
                  )}
                </div>
                <div className="mt-auto pt-6 border-t border-[#c9c4d9]">
                  <p className="text-center italic text-[12px] text-[#797588]">
                    Documento generado electrónicamente para validación clínica.
                  </p>
                </div>
              </div>

              {/* Page 2 placeholder */}
              <div className="bg-white w-full max-w-2xl p-10 md:p-14 flex flex-col gap-5 opacity-60 shadow-md">
                <div className="h-3 bg-[#dce2f3] w-3/4 rounded" />
                <div className="h-3 bg-[#dce2f3] w-full rounded" />
                <div className="h-3 bg-[#dce2f3] w-5/6 rounded" />
                <div className="h-3 bg-[#dce2f3] w-2/3 rounded" />
                <div className="mt-auto border-t border-dashed border-[#c9c4d9] pt-8 flex justify-between">
                  <div className="w-32 h-14 bg-[#dce2f3] rounded" />
                  <div className="w-32 h-14 bg-[#dce2f3] rounded" />
                </div>
              </div>
            </div>

            {/* PDF actions */}
            <div className="mt-3 flex justify-between items-center px-1">
              <button type="button"
                className="flex items-center gap-2 text-[#5427e6] text-[14px] font-medium hover:underline">
                <Download className="w-4 h-4" /> Descargar PDF para lectura offline
              </button>
              <span className="text-[12px] text-[#797588]">Scroll para leer todo</span>
            </div>
          </div>
        </div>

        {/* Signature section */}
        <div className="bg-white border border-[#c9c4d9] rounded-2xl p-6 md:p-10 flex flex-col gap-8">

          <div className="flex flex-col gap-4">
            <h2 className="text-[24px] font-semibold tracking-[-0.01em] text-[#151c27]">Validación de Firma</h2>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[#c9c4d9] text-[#5427e6] focus:ring-[#6d4aff] shrink-0"
              />
              <span className="text-[16px] text-[#151c27] group-hover:text-[#5427e6] transition-colors leading-relaxed">
                He leído y acepto los términos de este documento y consiento el tratamiento médico descrito.
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Signature canvas */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-medium text-[#797588]">Firme dentro del cuadro:</span>
                <button
                  type="button"
                  onClick={clearPad}
                  className="text-[12px] font-medium text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                  Limpiar trazo
                </button>
              </div>
              <div className="relative w-full h-48 bg-[#f9f9ff] border-2 border-dashed border-[#c9c4d9] rounded-xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full z-10 touch-none cursor-crosshair"
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                />
                {!hasSigned && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#c9c4d9] pointer-events-none">
                    <Pen className="w-10 h-10" strokeWidth={1} />
                    <span className="text-[14px] font-medium">Use su dedo o mouse para firmar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-end gap-4">
              <p className="text-[14px] text-[#484556] leading-relaxed">
                Al hacer clic en <strong>"Firmar documento"</strong>, usted acepta que esta es una firma legalmente vinculante que representa su identidad y consentimiento.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSign}
                  className="w-full h-14 bg-[#5427e6] text-white text-[14px] font-medium rounded-xl shadow-lg hover:bg-[#6d4aff] disabled:bg-[#c9c4d9] disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {signing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Firmar documento</>
                  )}
                </button>
                <button
                  type="button"
                  className="w-full h-14 bg-white border border-[#c9c4d9] text-[#151c27] text-[14px] font-medium rounded-xl hover:bg-[#f0f3ff] transition-all">
                  Guardar borrador y salir
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="w-full max-w-4xl px-4 py-8 text-center text-[12px] text-[#797588]">
        © {new Date().getFullYear()} Clínica Make — Sistema de Gestión Médica Segura.<br className="md:hidden" />{" "}
        Firma digital encriptada y legalmente válida.
      </footer>
    </div>
  );
}
