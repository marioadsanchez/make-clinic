"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw, Printer, MoreVertical, Clock, Stethoscope } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

type Patient = { id: string; full_name: string; phone?: string | null };
type Appointment = {
  id: string;
  title: string;
  type: string;
  status: string;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
  patients: Patient | null;
};

const STATUS_CONFIG: Record<string, { label: string; cardBg: string; borderColor: string; textColor: string; badgeBg: string; badgeText: string }> = {
  scheduled:   { label: "Programada",  cardBg: "bg-[#e7eefe]/40",  borderColor: "border-[#5427e6]", textColor: "text-[#5427e6]",  badgeBg: "bg-[#e5deff]", badgeText: "text-[#4500d8]" },
  confirmed:   { label: "Confirmado",  cardBg: "bg-[#e5deff]/30",  borderColor: "border-[#5427e6]", textColor: "text-[#5427e6]",  badgeBg: "bg-[#e5deff]", badgeText: "text-[#1b0063]" },
  in_progress: { label: "En Curso",    cardBg: "bg-[#e3e0f2]/20",  borderColor: "border-[#555462]", textColor: "text-[#555462]",  badgeBg: "bg-[#e3e0f2]", badgeText: "text-[#464553]" },
  completed:   { label: "Completada",  cardBg: "bg-[#dce2f3]/20",  borderColor: "border-[#575e70]", textColor: "text-[#575e70]",  badgeBg: "bg-[#dce2f7]", badgeText: "text-[#141b2b]" },
  cancelled:   { label: "Cancelada",   cardBg: "bg-red-50/40",     borderColor: "border-red-400",   textColor: "text-red-600",    badgeBg: "bg-red-100",   badgeText: "text-red-800" },
  no_show:     { label: "No asistió",  cardBg: "bg-red-50/40",     borderColor: "border-red-400",   textColor: "text-red-600",    badgeBg: "bg-red-100",   badgeText: "text-red-800" },
  pending:     { label: "Pendiente",   cardBg: "bg-[#dce2f7]/30",  borderColor: "border-[#575e70]", textColor: "text-[#575e70]",  badgeBg: "bg-[#dce2f7]", badgeText: "text-[#575e70]" },
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const HOUR_PX = 80; // h-20 = 80px
const START_HOUR = 8;

function timeToTopPx(iso: string) {
  const d = new Date(iso);
  return (d.getHours() - START_HOUR) * HOUR_PX + (d.getMinutes() / 60) * HOUR_PX;
}

function durationPx(startIso: string, endIso: string) {
  const diff = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000 / 60;
  return Math.max(40, (diff / 60) * HOUR_PX);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

// ─── Mini Calendar ──────────────────────────────────────────
function MiniCalendar({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const [viewing, setViewing] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  const monthLabel = viewing.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  const firstDay = ((viewing.getDay() + 6) % 7); // 0=Monday
  const daysInMonth = new Date(viewing.getFullYear(), viewing.getMonth() + 1, 0).getDate();
  const prevDays = new Date(viewing.getFullYear(), viewing.getMonth(), 0).getDate();
  const today = new Date();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });

  function prev() { setViewing(new Date(viewing.getFullYear(), viewing.getMonth() - 1, 1)); }
  function next() { setViewing(new Date(viewing.getFullYear(), viewing.getMonth() + 1, 1)); }

  return (
    <div className="bg-white border border-[#c9c4d9] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-semibold leading-[1.4] capitalize text-[#151c27]">{monthLabel}</h2>
        <div className="flex gap-1">
          <button type="button" title="Mes anterior" onClick={prev} className="p-1 hover:bg-[#e7eefe] rounded-md transition-colors text-[#484556]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" title="Mes siguiente" onClick={next} className="p-1 hover:bg-[#e7eefe] rounded-md transition-colors text-[#484556]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center mb-2">
        {["LU","MA","MI","JU","VI","SA","DO"].map(d => (
          <div key={d} className="text-[12px] font-medium text-[#484556] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-1">
        {cells.map((c, i) => {
          if (!c.current) return <div key={i} className="text-[14px] text-[#484556]/30 p-2">{c.day}</div>;
          const thisDate = new Date(viewing.getFullYear(), viewing.getMonth(), c.day);
          const isSel = thisDate.toDateString() === selected.toDateString();
          const isToday = thisDate.toDateString() === today.toDateString();
          return (
            <button key={i} type="button" onClick={() => onSelect(thisDate)}
              className={`text-[14px] p-2 rounded-full transition-colors ${
                isSel ? "bg-[#5427e6] text-white font-bold"
                : isToday ? "bg-[#e5deff] text-[#5427e6] font-bold"
                : "text-[#151c27] hover:bg-[#e7eefe]"
              }`}>
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main View ──────────────────────────────────────────────
export function AgendaView({ appointments, dateParam }: { appointments: Appointment[]; dateParam: string }) {
  const router = useRouter();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [nowTop, setNowTop] = useState<number | null>(null);
  const [view, setView] = useState<"day" | "week" | "month">("day");

  const selected = dateParam ? new Date(dateParam + "T12:00:00") : new Date();

  function toParam(d: Date) { return d.toISOString().slice(0, 10); }
  function goTo(d: Date) { router.push(`/agenda?fecha=${toParam(d)}`); }
  function prevDay() { const d = new Date(selected); d.setDate(d.getDate() - 1); goTo(d); }
  function nextDay() { const d = new Date(selected); d.setDate(d.getDate() + 1); goTo(d); }
  function goToday() { router.push("/agenda"); }

  const dateLabel = selected.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    function updateNow() {
      const now = new Date();
      const h = now.getHours(); const m = now.getMinutes();
      if (h >= START_HOUR && h <= 19) {
        setNowTop((h - START_HOUR) * HOUR_PX + (m / 60) * HOUR_PX);
      } else setNowTop(null);
    }
    updateNow();
    const t = setInterval(updateNow, 60000);
    return () => clearInterval(t);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (nowTop !== null && timelineRef.current) {
      timelineRef.current.scrollTop = Math.max(0, nowTop - 120);
    }
  }, [nowTop]);

  return (
    <section className="flex-1 flex gap-6 overflow-hidden p-6">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-1 hidden lg:flex" style={{ scrollbarWidth: "thin" }}>
        <MiniCalendar selected={selected} onSelect={goTo} />

        {/* Filters */}
        <div className="bg-white border border-[#c9c4d9] rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-[12px] font-medium text-[#151c27] uppercase tracking-widest mb-3">Especialista</h3>
            <div className="space-y-2">
              {["Dra. Directora", "Dr. Asociado"].map(name => (
                <label key={name} className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked type="checkbox"
                    className="w-4 h-4 rounded border-[#797588] text-[#5427e6] focus:ring-[#5427e6]" />
                  <span className="text-[14px] text-[#484556] group-hover:text-[#5427e6] transition-colors">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-medium text-[#151c27] uppercase tracking-widest mb-3">Procedimiento</h3>
            <select aria-label="Filtrar por procedimiento" className="w-full bg-[#f9f9ff] border border-[#c9c4d9] rounded-lg p-2 text-[14px] text-[#151c27] outline-none focus:ring-2 focus:ring-[#5427e6]/20">
              <option>Todos los servicios</option>
              <option>Consulta inicial</option>
              <option>Cirugía estética</option>
              <option>Procedimiento</option>
              <option>Seguimiento</option>
            </select>
          </div>
          <div>
            <h3 className="text-[12px] font-medium text-[#151c27] uppercase tracking-widest mb-3">Estado</h3>
            <div className="flex flex-wrap gap-2">
              {["Confirmado", "Pendiente", "En curso"].map(s => (
                <span key={s}
                  className="px-3 py-1 bg-[#dce2f3] text-[#5c6274] rounded-full text-[12px] border border-[#c9c4d9] cursor-pointer hover:bg-[#e5deff] transition-colors">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Timeline */}
      <div className="flex-1 flex flex-col bg-white border border-[#c9c4d9] rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[#c9c4d9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button type="button" title="Día anterior" onClick={prevDay}
                className="p-1.5 hover:bg-[#e7eefe] rounded-lg transition-colors text-[#484556]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" title="Ir a hoy" onClick={goToday}
                className="text-[20px] font-semibold leading-[1.4] text-[#151c27] capitalize hover:text-[#5427e6] transition-colors">
                {dateLabel}
              </button>
              <button type="button" title="Día siguiente" onClick={nextDay}
                className="p-1.5 hover:bg-[#e7eefe] rounded-lg transition-colors text-[#484556]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex p-1 bg-[#f0f3ff] rounded-lg">
              {(["day","week","month"] as const).map(v => (
                <button key={v} type="button" onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                    view === v ? "bg-white shadow-sm text-[#5427e6] font-bold" : "text-[#484556] hover:bg-[#e7eefe]"
                  }`}>
                  {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" title="Actualizar"
              className="p-2 hover:bg-[#e7eefe] rounded-full text-[#484556] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button type="button" title="Imprimir"
              className="p-2 hover:bg-[#e7eefe] rounded-full text-[#484556] transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button type="button" title="Más opciones"
              className="p-2 hover:bg-[#e7eefe] rounded-full text-[#484556] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: "thin" }}>
          <div className="grid grid-cols-[80px_1fr] divide-x divide-[#c9c4d9]/30">
            {/* Time column */}
            <div className="flex flex-col text-[#797588] text-[12px] font-medium">
              {HOURS.map(h => (
                <div key={h} className="h-20 flex items-center justify-center border-b border-[#c9c4d9]/20">
                  {h.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Events column */}
            <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
              {/* Hour grid lines */}
              {HOURS.map(h => (
                <div key={h} className="absolute w-full border-b border-[#c9c4d9]/20" style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX - 1 }} />
              ))}

              {/* Current time indicator */}
              {nowTop !== null && (
                <div className="absolute w-full border-t-2 border-[#5427e6] z-10 pointer-events-none" style={{ top: nowTop }}>
                  <span className="absolute -top-3 left-4 bg-[#5427e6] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    AHORA
                  </span>
                </div>
              )}

              {/* Empty state */}
              {appointments.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#484556]">
                  <div className="w-12 h-12 rounded-full bg-[#e7eefe] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#5427e6]" />
                  </div>
                  <p className="text-sm font-medium">Sin citas para este día</p>
                  <Link href="/agenda/nueva" className="text-sm text-[#5427e6] hover:underline">
                    + Nueva cita
                  </Link>
                </div>
              )}

              {/* Appointment cards */}
              {appointments.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.scheduled;
                const top = timeToTopPx(apt.starts_at);
                const height = durationPx(apt.starts_at, apt.ends_at);
                const isLong = height >= 120;
                const patient = apt.patients;

                return (
                  <div key={apt.id}
                    className={`absolute left-4 right-8 ${cfg.cardBg} border-l-4 ${cfg.borderColor} rounded-r-xl p-3 flex group hover:opacity-90 transition-all cursor-pointer shadow-sm`}
                    style={{ top, height }}>
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      {isLong && patient && (
                        <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] text-xs font-bold flex-shrink-0 border-2 border-white shadow-sm">
                          {initials(patient.full_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            {patient && (
                              <Link href={`/pacientes/${patient.id}`}
                                onClick={e => e.stopPropagation()}
                                className={`font-semibold truncate block ${isLong ? "text-[20px] leading-[1.4]" : "text-[14px]"} ${cfg.textColor} hover:underline`}>
                                {patient.full_name}
                              </Link>
                            )}
                            {isLong && (
                              <p className="text-[14px] text-[#484556] leading-none tracking-[0.01em]">{apt.title}</p>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                            {cfg.label}
                          </span>
                        </div>
                        {isLong && (
                          <div className="mt-2 flex items-center gap-4 text-[#484556]/80 text-[12px] font-medium">
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              Dra. Directora
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(apt.starts_at)} — {formatTime(apt.ends_at)}
                            </div>
                          </div>
                        )}
                        {!isLong && (
                          <p className="text-[11px] text-[#484556]">
                            {formatTime(apt.starts_at)} — {formatTime(apt.ends_at)} · {apt.title}
                          </p>
                        )}
                        {isLong && (
                          <div className="mt-3 flex gap-2">
                            <Link href={`/pacientes/${patient?.id}`}
                              onClick={e => e.stopPropagation()}
                              className="bg-white border border-[#c9c4d9] text-[#151c27] px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#e7eefe] transition-all">
                              Ver Historial
                            </Link>
                            <Link href={`/pacientes/${patient?.id}/consultas/nueva`}
                              onClick={e => e.stopPropagation()}
                              className="bg-[#5427e6] text-white px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#6d4aff] transition-all">
                              Iniciar Registro
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
