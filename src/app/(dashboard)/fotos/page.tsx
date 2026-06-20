"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Share2, Maximize2, Filter, Upload, BarChart2,
  Eye, Layers, Plus, ImagePlus, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Before/After Slider ────────────────────────────────────────────────
function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPct((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onUp = () => { dragging.current = false; };
    const onMove = (e: MouseEvent) => { if (dragging.current) move(e.clientX); };
    const onTouchMove = (e: TouchEvent) => { if (dragging.current) move(e.touches[0].clientX); };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [move]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-[400px] bg-[#d3daea] overflow-hidden select-none cursor-ew-resize"
    >
      {/* Before — always full width as base */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-[#c9c4d9] to-[#dce2f3] flex items-center justify-center">
          <span className="text-[#797588] text-[14px] font-medium">Foto preoperatoria</span>
        </div>
        <span className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-[#151c27]">
          Preoperatorio
        </span>
      </div>

      {/* After — clipped to slider pct */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white"
        style={{ width: `${pct}%` }}
      >
        <div
          className="absolute inset-y-0"
          style={{ width: `${containerRef.current?.getBoundingClientRect().width ?? 600}px` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#6d4aff]/30 to-[#5427e6]/20 flex items-center justify-center">
            <span className="text-[#5427e6] text-[14px] font-medium">Foto postoperatoria</span>
          </div>
        </div>
        <span className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-widest text-[#5427e6]">
          Postoperatorio
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
      >
        <div className="w-0.5 h-full bg-white shadow-xl" />
        <div className="absolute w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize border border-[#c9c4d9]">
          <span className="flex gap-0.5">
            <ChevronLeft className="w-3 h-3 text-[#5427e6]" />
            <ChevronRight className="w-3 h-3 text-[#5427e6]" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Category badge config ──────────────────────────────────────────────
type Category = "pre_op" | "pos_op" | "control" | "exito";
const CATEGORY_META: Record<Category, { label: string; cls: string }> = {
  pre_op:  { label: "Preop",   cls: "bg-red-500 text-white" },
  pos_op:  { label: "Postop",  cls: "bg-[#5427e6] text-white" },
  control: { label: "Control", cls: "bg-[#464553] text-white" },
  exito:   { label: "Éxito",   cls: "bg-emerald-500 text-white" },
};

// ── Mock gallery tiles ─────────────────────────────────────────────────
const MOCK_PHOTOS: {
  id: number; patient: string; procedure: string; cat: Category;
  color: string;
}[] = [
  { id: 1, patient: "Carlos Ruiz",    procedure: "Láser CO2",       cat: "control", color: "from-slate-300 to-slate-200" },
  { id: 2, patient: "Laura Méndez",   procedure: "Abdominoplastia",  cat: "pos_op",  color: "from-violet-200 to-purple-100" },
  { id: 3, patient: "Ricardo Gómez",  procedure: "Injerto Capilar",  cat: "pre_op",  color: "from-rose-200 to-red-100" },
  { id: 4, patient: "Sofía Vega",     procedure: "Relleno Labial",   cat: "pos_op",  color: "from-violet-200 to-indigo-100" },
  { id: 5, patient: "Julia Santos",   procedure: "Blefaroplastia",   cat: "pre_op",  color: "from-rose-200 to-pink-100" },
  { id: 6, patient: "María Costa",    procedure: "Rinoplastia",      cat: "exito",   color: "from-emerald-200 to-teal-100" },
  { id: 7, patient: "Diego López",    procedure: "Liposucción",      cat: "pos_op",  color: "from-blue-200 to-sky-100" },
  { id: 8, patient: "Ana Jiménez",    procedure: "Mastopexia",       cat: "control", color: "from-amber-200 to-yellow-100" },
  { id: 9, patient: "Fernando Ruiz",  procedure: "Otoplastia",       cat: "pre_op",  color: "from-rose-200 to-orange-100" },
  { id: 10, patient: "Patricia Soto", procedure: "Botox",            cat: "exito",   color: "from-emerald-200 to-green-100" },
];

type TabFilter = "all" | "pre_op" | "pos_op" | "control" | "exito";

const TAB_LABELS: { id: TabFilter; label: string }[] = [
  { id: "all",     label: "Todo" },
  { id: "pre_op",  label: "Preoperatorio" },
  { id: "pos_op",  label: "Postoperatorio" },
  { id: "control", label: "Controles" },
  { id: "exito",   label: "Casos de Éxito" },
];

// ── Page ──────────────────────────────────────────────────────────────
export default function FotosPage() {
  const [tab, setTab] = useState<TabFilter>("all");
  const [view, setView] = useState<"galeria" | "comparativa">("galeria");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = tab === "all" ? MOCK_PHOTOS : MOCK_PHOTOS.filter((p) => p.cat === tab);

  const stats = {
    total: MOCK_PHOTOS.length,
    preop: MOCK_PHOTOS.filter((p) => p.cat === "pre_op").length,
    postop: MOCK_PHOTOS.filter((p) => p.cat === "pos_op" || p.cat === "exito").length,
  };
  const barW = Math.round((stats.postop / stats.total) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <header className="h-16 shrink-0 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 border-b border-[#c9c4d9]">
        <div className="relative w-full max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="search"
            placeholder="Buscar por paciente o procedimiento..."
            className="w-full bg-[#f0f3ff] border border-[#c9c4d9] rounded-full py-2 pl-10 pr-4 text-[14px] focus:ring-2 focus:ring-[#5427e6] focus:border-[#5427e6] outline-none transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2 bg-[#6d4aff] text-white rounded-full text-[14px] font-medium hover:bg-[#5427e6] transition-all shrink-0 ml-4">
          <Upload className="w-4 h-4" /> Subir fotos
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#151c27]">Galería clínica</h2>
              <p className="text-[16px] text-[#484556] mt-1">Gestión avanzada de registros fotográficos y comparativas.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* View toggle */}
              <div className="flex bg-[#f0f3ff] p-1 rounded-xl border border-[#c9c4d9]">
                <button
                  type="button"
                  onClick={() => setView("galeria")}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                    view === "galeria"
                      ? "bg-white text-[#5427e6] shadow-sm border border-[#c9c4d9]"
                      : "text-[#484556] hover:text-[#151c27]"
                  }`}>
                  Galería
                </button>
                <button
                  type="button"
                  onClick={() => setView("comparativa")}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                    view === "comparativa"
                      ? "bg-white text-[#5427e6] shadow-sm border border-[#c9c4d9]"
                      : "text-[#484556] hover:text-[#151c27]"
                  }`}>
                  Comparativa
                </button>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#c9c4d9] rounded-xl text-[14px] font-medium text-[#151c27] hover:bg-[#f0f3ff] transition-all">
                <Filter className="w-4 h-4" /> Filtros
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6d4aff] text-white rounded-xl text-[14px] font-medium hover:bg-[#5427e6] transition-all">
                <Plus className="w-4 h-4" /> Subir fotos
              </button>
            </div>
          </div>

          {/* Comparativa mode */}
          {view === "comparativa" && (
            <div className="bg-white border border-[#c9c4d9] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 flex items-center justify-between border-b border-[#c9c4d9]/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] font-bold text-[14px]">EM</div>
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#151c27]">Elena Martínez</h3>
                    <p className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Rinoplastia Ultrasónica · Control 6 meses</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center border border-[#c9c4d9] hover:bg-[#f0f3ff] transition-colors" title="Compartir">
                    <Share2 className="w-4 h-4 text-[#484556]" />
                  </button>
                  <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center border border-[#c9c4d9] hover:bg-[#f0f3ff] transition-colors" title="Pantalla completa">
                    <Maximize2 className="w-4 h-4 text-[#484556]" />
                  </button>
                </div>
              </div>
              <BeforeAfterSlider />
              <p className="text-center text-[12px] text-[#797588] py-3">
                Arrastra el control deslizante para comparar antes y después
              </p>
            </div>
          )}

          {/* Gallery mode top bento */}
          {view === "galeria" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured comparison (col-span-2) */}
              <div className="lg:col-span-2 bg-white border border-[#c9c4d9] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 flex items-center justify-between border-b border-[#c9c4d9]/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#d9dff5] flex items-center justify-center text-[#5427e6] font-bold text-[14px]">EM</div>
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#151c27]">Elena Martínez</h3>
                      <p className="text-[12px] font-medium text-[#797588] uppercase tracking-wider">Rinoplastia Ultrasónica · Control 6 meses</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setView("comparativa")}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-[#c9c4d9] hover:bg-[#f0f3ff] transition-colors"
                      title="Ver comparativa">
                      <Layers className="w-4 h-4 text-[#484556]" />
                    </button>
                    <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center border border-[#c9c4d9] hover:bg-[#f0f3ff] transition-colors" title="Pantalla completa">
                      <Maximize2 className="w-4 h-4 text-[#484556]" />
                    </button>
                  </div>
                </div>
                <BeforeAfterSlider />
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Stats card */}
                <div className="bg-white border border-[#c9c4d9] rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[12px] font-bold text-[#797588] uppercase tracking-wider">Estado de Galería</h4>
                    <BarChart2 className="w-5 h-5 text-[#5427e6]" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[48px] font-bold leading-none text-[#151c27]">{stats.total}</p>
                        <p className="text-[14px] text-[#484556]">Fotos totales</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#5427e6] font-bold text-[14px]">+42 esta semana</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#e7eefe] h-2 rounded-full overflow-hidden">
                      <div className={`bg-[#5427e6] h-full ${
                        barW >= 75 ? "w-3/4" : barW >= 50 ? "w-1/2" : "w-1/4"
                      }`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-2xl bg-[#e7eefe]">
                        <p className="text-[12px] text-[#797588]">Preop</p>
                        <p className="text-[20px] font-semibold text-[#151c27]">{stats.preop}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#e7eefe]">
                        <p className="text-[12px] text-[#797588]">Postop</p>
                        <p className="text-[20px] font-semibold text-[#151c27]">{stats.postop}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload dropzone */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-3xl p-6 border-2 border-dashed border-[#c9c4d9] bg-[#f0f3ff] flex flex-col items-center justify-center text-center gap-4 h-52 hover:border-[#5427e6]/50 hover:bg-[#e7eefe] transition-all group cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-[#e5deff] flex items-center justify-center text-[#5427e6] group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[20px] font-semibold text-[#151c27]">Subida rápida</p>
                    <p className="text-[14px] text-[#484556] mt-1 px-2">Arrastra fotos aquí o haz clic para seleccionar archivos de pacientes</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-[#c9c4d9] pb-0">
            {TAB_LABELS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-[#5427e6] text-[#5427e6] font-bold"
                    : "border-transparent text-[#484556] hover:text-[#151c27]"
                }`}>
                {t.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 pb-2">
              <span className="text-[12px] text-[#797588]">Ordenar por:</span>
              <select
                aria-label="Ordenar fotos"
                className="bg-transparent border-none text-[14px] font-bold text-[#151c27] focus:ring-0 cursor-pointer outline-none">
                <option>Más recientes</option>
                <option>Paciente A-Z</option>
                <option>Procedimiento</option>
              </select>
            </div>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((photo) => {
              const meta = CATEGORY_META[photo.cat];
              return (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all border border-[#c9c4d9]/30 cursor-pointer">
                  {/* Placeholder image */}
                  <div className={`w-full h-full bg-gradient-to-br ${photo.color}`} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-[14px] leading-tight">{photo.patient}</p>
                    <p className="text-white/80 text-[12px] mt-0.5">{photo.procedure}</p>
                    <div className="flex gap-2 mt-2">
                      <button type="button" className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm transition-colors" title="Ver">
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("comparativa")}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm transition-colors"
                        title="Comparar">
                        <Layers className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Category badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}

            {/* "Add photo" tile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/5] rounded-2xl border-2 border-dashed border-[#c9c4d9] bg-[#f0f3ff] flex flex-col items-center justify-center gap-2 hover:border-[#5427e6]/50 hover:bg-[#e7eefe] transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#e5deff] flex items-center justify-center text-[#5427e6] group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-[#484556] text-center px-2">Subir foto</span>
            </button>
          </div>

        </div>
      </div>

      {/* FAB mobile */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-20 md:bottom-8 right-8 w-14 h-14 bg-[#6d4aff] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95 z-50 md:hidden">
        <ImagePlus className="w-6 h-6" />
      </button>
    </div>
  );
}
