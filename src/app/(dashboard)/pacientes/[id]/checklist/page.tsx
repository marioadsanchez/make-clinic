"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ShieldCheck, Info,
  CheckCircle, Clock, Camera, CreditCard, Calendar,
  Users, Stethoscope, Save, CheckSquare,
} from "lucide-react";

type ItemStatus = "done" | "in_progress" | "pending" | "upcoming";

type CheckItem = {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  footer?: string;
  footerAction?: string;
  icon: React.ReactNode;
};

const STATUS_META: Record<ItemStatus, { label: string; badgeCls: string; iconCls: string }> = {
  done:        { label: "Done",        badgeCls: "bg-emerald-50 text-emerald-600", iconCls: "bg-emerald-50 text-emerald-600" },
  in_progress: { label: "In Progress", badgeCls: "bg-[#5427e6]/10 text-[#5427e6] animate-pulse", iconCls: "bg-[#e5deff] text-[#5427e6]" },
  pending:     { label: "Pending",     badgeCls: "bg-amber-50 text-amber-600",     iconCls: "bg-amber-50 text-amber-600" },
  upcoming:    { label: "Upcoming",    badgeCls: "bg-[#e7eefe] text-[#484556]",   iconCls: "bg-[#e7eefe] text-[#797588]" },
};

const DEFAULT_ITEMS: Omit<CheckItem, "icon">[] = [
  {
    id: "exams",
    title: "Exámenes recibidos",
    description: "Laboratorio, ECG y placa de tórax validados por anestesia.",
    status: "done",
    footer: "Actualizado: Hoy, 09:15",
    footerAction: "Ver archivos",
  },
  {
    id: "consent",
    title: "Consentimiento firmado",
    description: "Documento digital firmado vía plataforma segura por el paciente.",
    status: "done",
    footer: "ID de firma: #SGN-9902",
    footerAction: "Descargar PDF",
  },
  {
    id: "photos",
    title: "Fotografías preoperatorias",
    description: "Set de 5 ángulos clínicos requeridos para la planificación 3D.",
    status: "in_progress",
    footerAction: "Subir fotos",
  },
  {
    id: "instructions",
    title: "Indicaciones enviadas",
    description: "Ayuno, medicación previa y vestimenta comunicados por email.",
    status: "done",
    footer: "Leído: Ayer, 18:30",
  },
  {
    id: "payment",
    title: "Pago confirmado",
    description: "Validación final de la pasarela de pagos pendiente de depósito.",
    status: "pending",
    footer: "Monto pendiente de confirmar",
    footerAction: "Reenviar link",
  },
  {
    id: "date",
    title: "Fecha confirmada",
    description: "Horario y pabellón reservados con el equipo quirúrgico.",
    status: "done",
    footer: "Quirófano asignado",
  },
  {
    id: "team",
    title: "Equipo confirmado",
    description: "Anestesiólogo, enfermera instrumentista y circulante asignados.",
    status: "done",
    footer: "3 profesionales asignados",
    footerAction: "Ver equipo",
  },
  {
    id: "procedure",
    title: "Procedimiento realizado",
    description: "Registro de tiempos quirúrgicos y hallazgos intraoperatorios.",
    status: "upcoming",
    footer: "Habilitado tras ingreso a quirófano",
  },
];

const ICONS: Record<string, React.ReactNode> = {
  exams:       <Stethoscope className="w-5 h-5" />,
  consent:     <CheckSquare className="w-5 h-5" />,
  photos:      <Camera className="w-5 h-5" />,
  instructions:<CheckCircle className="w-5 h-5" />,
  payment:     <CreditCard className="w-5 h-5" />,
  date:        <Calendar className="w-5 h-5" />,
  team:        <Users className="w-5 h-5" />,
  procedure:   <Clock className="w-5 h-5" />,
};

type Patient = { full_name: string; id: string };

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [items, setItems] = useState<CheckItem[]>(
    DEFAULT_ITEMS.map((i) => ({ ...i, icon: ICONS[i.id] }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setPatient({ full_name: d.full_name, id: d.id }));
  }, [id]);

  const doneCount = items.filter((i) => i.status === "done").length;
  const progressPct = Math.round((doneCount / items.length) * 100);
  const pendingCount = items.filter((i) => i.status === "pending" || i.status === "in_progress").length;

  const STEPS = 4;
  const doneSteps = Math.round((doneCount / items.length) * STEPS);

  function cycleStatus(itemId: string) {
    const order: ItemStatus[] = ["upcoming", "pending", "in_progress", "done"];
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextIdx = (order.indexOf(item.status) + 1) % order.length;
        return { ...item, status: order[nextIdx] };
      })
    );
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center gap-3 px-6 border-b border-[#c9c4d9]">
        <Link href={`/pacientes/${id}`}
          className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-[14px] text-[#484556]">Pacientes</span>
        <ChevronRight className="w-4 h-4 text-[#c9c4d9]" />
        {patient && (
          <>
            <Link href={`/pacientes/${id}`}
              className="text-[14px] text-[#484556] hover:text-[#5427e6] transition-colors truncate max-w-[160px]">
              {patient.full_name}
            </Link>
            <ChevronRight className="w-4 h-4 text-[#c9c4d9]" />
          </>
        )}
        <span className="text-[14px] font-medium text-[#151c27]">Checklist quirúrgico</span>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#151c27]">
                Checklist quirúrgico
              </h2>
              {patient && (
                <p className="text-[16px] text-[#484556] mt-1">
                  Paciente: <span className="font-medium text-[#151c27]">{patient.full_name}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 bg-[#e5deff] text-[#5427e6] px-4 py-2 rounded-xl border border-[#5427e6]/10 shrink-0">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[14px] font-medium">Protocolo de Seguridad Activado</span>
            </div>
          </div>

          {/* Progress card */}
          <div className="bg-white border border-[#c9c4d9] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-medium text-[#151c27]">Progreso de preparación</span>
              <span className="text-[20px] font-semibold text-[#5427e6]">{progressPct}%</span>
            </div>
            <div className="h-3 w-full bg-[#e7eefe] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5427e6] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-colors duration-500 ${
                    i < doneSteps ? "bg-[#5427e6]" : "bg-[#e7eefe]"
                  }`}
                />
              ))}
            </div>
            <p className="text-[12px] text-[#797588] mt-3">
              {doneCount} de {items.length} ítems completados
              {pendingCount > 0 && ` · ${pendingCount} requieren acción`}
            </p>
          </div>

          {/* Bento checklist grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const meta = STATUS_META[item.status];
              const isDone = item.status === "done";
              const isInProgress = item.status === "in_progress";
              const isUpcoming = item.status === "upcoming";
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer ${
                    isInProgress
                      ? "border-2 border-[#5427e6]/20 ring-4 ring-[#5427e6]/5 shadow-md"
                      : "border border-[#c9c4d9] hover:border-[#5427e6]/30"
                  } ${isUpcoming ? "opacity-80 hover:opacity-100" : ""}`}
                  onClick={() => cycleStatus(item.id)}
                  title="Clic para cambiar estado"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${meta.iconCls}`}>
                      {isDone ? <CheckCircle className="w-5 h-5" /> : item.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${meta.badgeCls}`}>
                      {meta.label}
                    </span>
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#151c27] mb-1 leading-snug">{item.title}</h3>
                  <p className="text-[14px] text-[#484556] leading-relaxed">{item.description}</p>
                  <div className={`mt-4 pt-4 border-t border-[#c9c4d9] ${
                    isInProgress && item.footerAction ? "flex" : "flex items-center justify-between"
                  } text-[12px] text-[#797588]`}>
                    {isInProgress && item.footerAction ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); cycleStatus(item.id); }}
                        className="w-full bg-[#5427e6] text-white py-2 rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-colors">
                        {item.footerAction}
                      </button>
                    ) : (
                      <>
                        <span>{item.footer ?? ""}</span>
                        {item.footerAction && !isUpcoming && (
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#5427e6] hover:underline font-medium">
                            {item.footerAction}
                          </button>
                        )}
                        {!item.footer && isUpcoming && (
                          <span className="text-[#797588] italic">Habilitado próximamente</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer action bar */}
          <div className="bg-[#e7eefe] border border-white/30 backdrop-blur-md p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4">
            <div className="flex items-center gap-3 text-[#484556] px-2">
              <Info className="w-5 h-5 text-[#5427e6] shrink-0" />
              <span className="text-[14px]">
                {pendingCount > 0
                  ? <>Faltan <strong className="text-[#151c27]">{pendingCount} elemento{pendingCount !== 1 ? "s" : ""}</strong> para completar el protocolo de seguridad pre-quirúrgico.</>
                  : <strong className="text-green-700">✓ Protocolo completo. Listo para cirugía.</strong>
                }
              </span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-[#c9c4d9] text-[#151c27] text-[14px] font-medium hover:bg-white/60 transition-colors flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar Borrador"}
              </button>
              <button
                type="button"
                disabled={pendingCount > 0}
                className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-[#5427e6] text-white text-[14px] font-medium shadow-md hover:bg-[#6d4aff] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Finalizar Protocolo
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* FAB mobile */}
      <button
        type="button"
        onClick={handleSave}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#5427e6] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50 md:hidden">
        <Save className="w-6 h-6" />
      </button>
    </div>
  );
}
