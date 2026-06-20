"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Info, MessageSquare, Stethoscope, ClipboardList, Eye,
  Camera, FileText, Printer, Share2, AlertTriangle, Plus, X, Upload
} from "lucide-react";

type Patient = {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  allergies: string[] | null;
  phone: string | null;
};

function age(dob: string | null) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export default function NuevaConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [fecha, setFecha] = useState(today);
  const [hora, setHora] = useState(nowTime);
  const [tipo, setTipo] = useState("consulta");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [physicalExam, setPhysicalExam] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [notes, setNotes] = useState("");

  // Signos vitales
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [spo2, setSpo2] = useState("");

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then(r => r.json())
      .then(d => setPatient(d.patient ?? d));
  }, [id]);

  async function submit(draft = false) {
    setSaving(true);
    setError("");

    const vitalNote = (bp || pulse || temp || spo2)
      ? `\n\n[Signos vitales] PA: ${bp || "—"} | Pulso: ${pulse || "—"} bpm | Temp: ${temp || "—"}°C | SPO2: ${spo2 || "—"}%`
      : "";

    const dateTime = `${fecha}T${hora}:00`;

    const res = await fetch(`/api/pacientes/${id}/consultas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateTime,
        type: tipo,
        chief_complaint: chiefComplaint,
        history,
        physical_exam: physicalExam,
        diagnosis,
        treatment_plan: treatmentPlan,
        notes: notes + vitalNote,
        status: draft ? "draft" : "completed",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/pacientes/${id}/consultas/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const inputCls = "w-full bg-[#f9f9ff] border border-[#c9c4d9] rounded-lg px-3 py-2 text-[16px] text-[#151c27] placeholder:text-[#797588] focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "block text-[14px] font-medium text-[#484556] mb-1.5";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 border-b border-[#c9c4d9]">
        <div className="flex items-center gap-3">
          <Link href={`/pacientes/${id}`}
            className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#151c27]">
            Nueva consulta
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => submit(true)} disabled={saving}
            className="px-4 py-2 text-[#5427e6] text-[14px] font-medium hover:bg-[#e5deff] rounded-lg transition-all disabled:opacity-50">
            Guardar borrador
          </button>
          <button type="button" onClick={() => submit(false)} disabled={saving}
            className="px-5 py-2 bg-[#5427e6] text-white text-[14px] font-medium rounded-lg shadow-sm hover:bg-[#6d4aff] active:scale-95 transition-all disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar consulta"}
          </button>
          <div className="h-8 w-px bg-[#c9c4d9] mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] text-xs font-bold">
              DR
            </div>
            <span className="text-[14px] font-medium text-[#151c27] hidden lg:block">Dra. Admin</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 md:pb-6">
        {/* Patient summary bar */}
        {patient && (
          <div className="bg-white border border-[#c9c4d9] rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] font-bold text-sm shrink-0">
                {initials(patient.full_name)}
              </div>
              <div>
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">{patient.full_name}</h3>
                <p className="text-[14px] text-[#484556]">
                  {age(patient.date_of_birth) ? `${age(patient.date_of_birth)} años` : "Edad desconocida"}
                  {patient.phone ? ` • ${patient.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              {(patient.allergies?.length ?? 0) > 0 && (
                <div className="text-right">
                  <span className="block text-[12px] font-medium text-[#797588] uppercase tracking-wider mb-1">Alergias</span>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                    <span className="text-[14px] font-semibold text-[#ba1a1a]">{patient.allergies!.join(", ")}</span>
                  </div>
                </div>
              )}
              <div className="text-right">
                <span className="block text-[12px] font-medium text-[#797588] uppercase tracking-wider mb-1">Estado</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-[12px] font-medium">Activo</span>
              </div>
            </div>
          </div>
        )}

        {/* 12-col grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT: form sections (8 cols) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Sección 1: Información general */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-5 h-5 text-[#5427e6]" />
                <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Información general</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls} htmlFor="fecha">Fecha</label>
                  <input id="fecha" type="date" title="Fecha de la consulta" value={fecha} onChange={e => setFecha(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="hora">Hora</label>
                  <input id="hora" type="time" title="Hora de la consulta" value={hora} onChange={e => setHora(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Médico</label>
                  <select className={inputCls} aria-label="Médico">
                    <option>Dra. Admin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls} aria-label="Tipo de consulta">
                    <option value="consulta">Consulta</option>
                    <option value="follow_up">Control Post-Op</option>
                    <option value="evaluation">Evaluación Inicial</option>
                    <option value="procedure">Procedimiento</option>
                    <option value="surgery">Cirugía</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Sección 2: Motivo de consulta */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#5427e6]" />
                <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Motivo de consulta</h4>
              </div>
              <textarea rows={3} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)}
                placeholder="Describa el motivo principal expresado por el paciente..."
                className={textareaCls} />
            </section>

            {/* Sección 3: Evaluación clínica */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ClipboardList className="w-5 h-5 text-[#5427e6]" />
                <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Evaluación clínica</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Anamnesis / Historia actual</label>
                  <textarea rows={3} value={history} onChange={e => setHistory(e.target.value)}
                    placeholder="Descripción de la enfermedad o situación actual..."
                    className={textareaCls} />
                </div>
                <div>
                  <label className={labelCls}>Examen físico</label>
                  <textarea rows={4} value={physicalExam} onChange={e => setPhysicalExam(e.target.value)}
                    placeholder="Detalles de la exploración física, hallazgos y estado actual..."
                    className={textareaCls} />
                </div>
              </div>
            </section>

            {/* Secciones 4 & 5: Diagnóstico + Plan (bento 2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Stethoscope className="w-5 h-5 text-[#5427e6]" />
                  <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Diagnóstico</h4>
                </div>
                <textarea rows={5} value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Impresión diagnóstica..."
                  className={textareaCls} />
              </section>
              <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-[#5427e6]" />
                  <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Plan / Conducta</h4>
                </div>
                <textarea rows={5} value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                  placeholder="Pasos a seguir, recetas o tratamientos indicados..."
                  className={textareaCls} />
              </section>
            </div>

            {/* Sección 6: Observaciones */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-[#5427e6]" />
                <h4 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">Observaciones</h4>
              </div>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Notas internas o comentarios adicionales..."
                className={textareaCls} />
            </section>

            {error && (
              <div className="rounded-lg bg-[#ffdad6] px-4 py-3 text-[14px] text-[#93000a]">{error}</div>
            )}
          </div>

          {/* RIGHT: sticky sidebar (4 cols) */}
          <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-20">

            {/* Signos Vitales */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-5 shadow-sm">
              <h4 className="text-[12px] font-medium text-[#797588] uppercase tracking-widest mb-4">
                Signos Vitales
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Presión (mmHg)", value: bp, set: setBp, placeholder: "120/80" },
                  { label: "Pulso (bpm)",    value: pulse, set: setPulse, placeholder: "72" },
                  { label: "Temp (°C)",      value: temp, set: setTemp, placeholder: "36.5" },
                  { label: "SPO2 (%)",       value: spo2, set: setSpo2, placeholder: "98" },
                ].map(v => (
                  <div key={v.label} className="p-3 bg-[#f9f9ff] rounded-lg border border-[#c9c4d9]/50">
                    <span className="text-[12px] font-medium text-[#484556] block mb-1">{v.label}</span>
                    <input type="text" value={v.value} onChange={e => v.set(e.target.value)}
                      placeholder={v.placeholder}
                      className="w-full bg-transparent border-none p-0 text-[20px] font-bold text-[#151c27] focus:ring-0 outline-none placeholder:text-[#c9c4d9] placeholder:font-normal placeholder:text-base" />
                  </div>
                ))}
              </div>
            </section>

            {/* Registro fotográfico */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[12px] font-medium text-[#797588] uppercase tracking-widest">
                  Registro Fotográfico
                </h4>
                <Link href={`/pacientes/${id}/fotos`}
                  className="text-[#5427e6] text-[12px] font-medium flex items-center gap-1 hover:underline">
                  <Camera className="w-3.5 h-3.5" /> Subir
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-[#f0f3ff] rounded-lg flex items-center justify-center border-2 border-dashed border-[#c9c4d9] cursor-pointer hover:bg-[#e7eefe] transition-all group">
                  <Plus className="w-5 h-5 text-[#484556] group-hover:scale-110 transition-transform" />
                </div>
                <div className="aspect-square bg-[#f0f3ff] rounded-lg flex items-center justify-center border border-[#c9c4d9]">
                  <Camera className="w-5 h-5 text-[#c9c4d9]" />
                </div>
                <div className="aspect-square bg-[#f0f3ff] rounded-lg flex items-center justify-center border border-[#c9c4d9]">
                  <Camera className="w-5 h-5 text-[#c9c4d9]" />
                </div>
              </div>
            </section>

            {/* Documentos anexos */}
            <section className="bg-white border border-[#c9c4d9] rounded-xl p-5 shadow-sm">
              <h4 className="text-[12px] font-medium text-[#797588] uppercase tracking-widest mb-4">
                Documentos Anexos
              </h4>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-[#c9c4d9] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[#484556] hover:bg-[#f0f3ff] transition-colors cursor-pointer">
                  <Upload className="w-7 h-7 text-[#797588]" />
                  <p className="text-[12px] font-medium text-center">Arrastra o haz clic para subir</p>
                </div>
              </div>
            </section>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                className="flex items-center justify-center gap-2 p-3 border border-[#c9c4d9] rounded-xl text-[14px] font-medium text-[#484556] hover:bg-[#e7eefe] transition-all">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button type="button"
                className="flex items-center justify-center gap-2 p-3 border border-[#c9c4d9] rounded-xl text-[14px] font-medium text-[#484556] hover:bg-[#e7eefe] transition-all">
                <Share2 className="w-4 h-4" /> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
