"use client";

import { useState } from "react";
import { Building2, Upload, Trash2, UserPlus, MoreVertical, Plus, Crown, Stethoscope, FileText } from "lucide-react";
import Link from "next/link";

type Clinic = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const TABS = [
  { id: "clinica",     label: "Clínica" },
  { id: "usuarios",   label: "Usuarios" },
  { id: "procedimientos", label: "Procedimientos" },
  { id: "propuestas", label: "Plantillas de propuestas" },
  { id: "documentos", label: "Plantillas de documentos" },
] as const;

type TabId = typeof TABS[number]["id"];

const MOCK_USERS = [
  { initials: "DR", name: "Dra. Admin", role: "Administradora", color: "bg-[#d9dff5] text-[#5427e6]" },
  { initials: "RS", name: "Dr. Ricardo Silva", role: "Doctor", color: "bg-[#dce2f3] text-[#151c27]" },
  { initials: "AP", name: "Ana Pérez", role: "Recepción", color: "bg-[#dce2f3] text-[#151c27]" },
];

const MOCK_PROCEDURES = [
  { name: "Consulta inicial", duration: "30 min", price: "$500" },
  { name: "Toxina botulínica", duration: "45 min", price: "$2,500" },
  { name: "Relleno dérmico", duration: "60 min", price: "$4,000" },
  { name: "Peeling químico", duration: "45 min", price: "$1,800" },
  { name: "Lifting facial", duration: "90 min", price: "$8,000" },
];

export function ConfigView({ clinic }: { clinic: Clinic | null }) {
  const [tab, setTab] = useState<TabId>("clinica");
  const [form, setForm] = useState({
    name: clinic?.name ?? "",
    email: clinic?.email ?? "",
    phone: clinic?.phone ?? "",
    address: clinic?.address ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/configuracion/clinica", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[32px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#151c27] mb-2">
            Configuración
          </h2>
          <p className="text-[16px] text-[#484556] leading-relaxed">
            Gestiona la identidad de tu clínica, usuarios y preferencias del sistema.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#c9c4d9] mb-8 overflow-x-auto gap-8" style={{ scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`relative py-4 text-[14px] font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "text-[#5427e6] font-bold"
                  : "text-[#484556] hover:text-[#151c27]"
              }`}>
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#5427e6] rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "clinica" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Información General */}
              <section className="bg-white border border-[#c9c4d9] rounded-xl p-8">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-6">
                  Información General
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[14px] font-medium text-[#151c27] mb-2">Nombre de la Clínica</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nombre de tu clínica"
                      className="w-full px-4 py-3 bg-white border border-[#c9c4d9] rounded-lg text-[16px] text-[#151c27] focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#151c27] mb-2">Correo de contacto</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="contacto@clinica.com"
                      className="w-full px-4 py-3 bg-white border border-[#c9c4d9] rounded-lg text-[16px] text-[#151c27] focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-[#151c27] mb-2">Teléfono</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+52 55 1234 5678"
                      className="w-full px-4 py-3 bg-white border border-[#c9c4d9] rounded-lg text-[16px] text-[#151c27] focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[14px] font-medium text-[#151c27] mb-2">Dirección</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Calle, ciudad, país"
                      className="w-full px-4 py-3 bg-white border border-[#c9c4d9] rounded-lg text-[16px] text-[#151c27] focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all" />
                  </div>
                </div>
              </section>

              {/* Branding */}
              <section className="bg-white border border-[#c9c4d9] rounded-xl p-8">
                <h3 className="text-[20px] font-semibold leading-[1.4] text-[#151c27] mb-6">Branding e Identidad</h3>
                <div className="space-y-8">
                  {/* Logo */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-xl border border-[#c9c4d9] bg-[#f0f3ff] flex items-center justify-center overflow-hidden">
                        <Building2 className="w-10 h-10 text-[#c9c4d9]" />
                      </div>
                      <button type="button" title="Editar logo"
                        className="absolute -bottom-2 -right-2 bg-[#5427e6] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-[#6d4aff] transition-colors">
                        <span className="text-sm font-bold">+</span>
                      </button>
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#151c27]">Logo de la Clínica</h4>
                      <p className="text-[14px] text-[#484556] mt-1">Recomendado: 512×512px. PNG o SVG.</p>
                      <div className="mt-4 flex gap-3">
                        <button type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                          <Upload className="w-4 h-4" /> Subir logo
                        </button>
                        <button type="button"
                          className="flex items-center gap-2 px-4 py-2 border border-[#c9c4d9] rounded-lg text-[14px] font-medium text-[#151c27] hover:bg-[#e7eefe] transition-all">
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Brand colors */}
                  <div>
                    <h4 className="text-[14px] font-bold text-[#151c27] mb-4">Colores de Marca</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-3 p-3 border border-[#c9c4d9] rounded-lg">
                        <div className="w-8 h-8 rounded bg-[#5427e6]" />
                        <div>
                          <p className="text-[12px] font-medium text-[#484556] leading-none">Primario</p>
                          <p className="text-[14px] text-[#151c27] mt-1 uppercase font-mono">#5427E6</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border border-[#c9c4d9] rounded-lg">
                        <div className="w-8 h-8 rounded bg-[#151c27]" />
                        <div>
                          <p className="text-[12px] font-medium text-[#484556] leading-none">Secundario</p>
                          <p className="text-[14px] text-[#151c27] mt-1 uppercase font-mono">#151C27</p>
                        </div>
                      </div>
                      <button type="button" title="Agregar color"
                        className="flex items-center justify-center w-12 h-[54px] border border-dashed border-[#c9c4d9] rounded-lg text-[#484556] hover:bg-[#e7eefe] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <div className="space-y-8">
              {/* User management */}
              <section className="bg-white border border-[#c9c4d9] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[14px] font-bold text-[#151c27]">Gestión de Usuarios</h3>
                  <button type="button" className="text-[#5427e6] text-[12px] font-medium hover:underline"
                    onClick={() => setTab("usuarios")}>
                    Ver todos
                  </button>
                </div>
                <div className="space-y-3">
                  {MOCK_USERS.map(u => (
                    <div key={u.name} className="flex items-center justify-between py-2 border-b border-[#c9c4d9] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.color}`}>
                          {u.initials}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#151c27]">{u.name}</p>
                          <p className="text-[12px] text-[#484556]">{u.role}</p>
                        </div>
                      </div>
                      <button type="button" title="Opciones" className="text-[#484556] hover:text-[#5427e6] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button"
                  className="w-full mt-6 flex items-center justify-center gap-2 py-2 px-4 border border-[#c9c4d9] rounded-lg text-[14px] font-medium text-[#151c27] hover:bg-[#e7eefe] transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Invitar usuario
                </button>
              </section>

              {/* Plan widget */}
              <section className="bg-[#6d4aff] text-white rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5" />
                    <h3 className="text-[20px] font-semibold leading-[1.4]">Plan Premium</h3>
                  </div>
                  <p className="text-[14px] mb-6 opacity-90 leading-relaxed">
                    Tu clínica tiene acceso a todas las funcionalidades avanzadas.
                  </p>
                  <button type="button"
                    className="w-full py-2 px-4 bg-white text-[#5427e6] rounded-lg text-[14px] font-medium hover:bg-opacity-90 transition-all">
                    Gestionar Plan
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "usuarios" && (
          <div className="bg-white border border-[#c9c4d9] rounded-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-[#c9c4d9] flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-[#151c27]">Usuarios del sistema</h3>
              <button type="button"
                className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-full text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                <UserPlus className="w-4 h-4" /> Invitar usuario
              </button>
            </div>
            <div className="divide-y divide-[#c9c4d9]">
              {[
                { initials: "DR", name: "Dra. Admin", email: "admin@makeclinic.com", role: "Administradora", color: "bg-[#d9dff5] text-[#5427e6]" },
                { initials: "RS", name: "Dr. Ricardo Silva", email: "r.silva@makeclinic.com", role: "Doctor", color: "bg-[#dce2f3] text-[#151c27]" },
                { initials: "AP", name: "Ana Pérez", email: "a.perez@makeclinic.com", role: "Recepción", color: "bg-[#dce2f3] text-[#151c27]" },
              ].map(u => (
                <div key={u.name} className="flex items-center justify-between px-8 py-5 hover:bg-[#f9f9ff] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u.color}`}>
                      {u.initials}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#151c27]">{u.name}</p>
                      <p className="text-[12px] text-[#484556]">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-[#e7eefe] text-[#5427e6] rounded-full text-[12px] font-medium">
                      {u.role}
                    </span>
                    <button type="button" title="Opciones" className="text-[#484556] hover:text-[#5427e6] transition-colors p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "procedimientos" && (
          <div className="bg-white border border-[#c9c4d9] rounded-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-[#c9c4d9] flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-semibold text-[#151c27]">Catálogo de procedimientos</h3>
                <p className="text-[14px] text-[#484556] mt-1">Procedimientos y precios base para propuestas.</p>
              </div>
              <Link href="/configuracion/procedimientos/nuevo"
                className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-full text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                <Plus className="w-4 h-4" /> Nuevo procedimiento
              </Link>
            </div>
            <div className="divide-y divide-[#c9c4d9]">
              {MOCK_PROCEDURES.map(p => (
                <div key={p.name} className="flex items-center justify-between px-8 py-4 hover:bg-[#f9f9ff] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#e7eefe] flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-[#5427e6]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#151c27]">{p.name}</p>
                      <p className="text-[12px] text-[#484556]">{p.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-semibold text-[#151c27]">{p.price}</span>
                    <button type="button" title="Opciones" className="text-[#484556] hover:text-[#5427e6] transition-colors p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === "propuestas" || tab === "documentos") && (
          <div className="bg-white border border-[#c9c4d9] rounded-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-[#c9c4d9] flex items-center justify-between">
              <div>
                <h3 className="text-[20px] font-semibold text-[#151c27]">
                  {tab === "propuestas" ? "Plantillas de propuestas" : "Plantillas de documentos"}
                </h3>
                <p className="text-[14px] text-[#484556] mt-1">Textos reutilizables con variables dinámicas.</p>
              </div>
              <Link href={tab === "propuestas" ? "/configuracion/plantillas" : "/documentos/nova"}
                className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-full text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                <Plus className="w-4 h-4" /> Nueva plantilla
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-[#484556]">
              <div className="w-14 h-14 rounded-full bg-[#e7eefe] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[#5427e6]" />
              </div>
              <p className="text-[16px] font-medium text-[#151c27]">Sin plantillas aún</p>
              <p className="text-[14px] text-[#484556] mt-1 mb-6">Crea tu primera plantilla para agilizar tu flujo.</p>
              <Link href={tab === "propuestas" ? "/configuracion/plantillas" : "/documentos/nova"}
                className="px-6 py-2.5 bg-[#5427e6] text-white rounded-lg text-[14px] font-medium hover:bg-[#6d4aff] transition-all">
                Crear plantilla
              </Link>
            </div>
          </div>
        )}

        {/* Footer actions (only Clínica tab) */}
        {tab === "clinica" && (
          <div className="mt-12 pt-8 border-t border-[#c9c4d9] flex justify-end gap-4">
            <button type="button"
              onClick={() => setForm({ name: clinic?.name ?? "", email: clinic?.email ?? "", phone: clinic?.phone ?? "", address: clinic?.address ?? "" })}
              className="px-6 py-3 border border-[#c9c4d9] rounded-xl text-[14px] font-medium text-[#151c27] hover:bg-[#e7eefe] transition-all">
              Descartar cambios
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="px-6 py-3 bg-[#5427e6] text-white rounded-xl text-[14px] font-medium shadow-md shadow-[#5427e6]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60">
              {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
