"use client";

import Link from "next/link";
import { Bell, CalendarDays, Plus, Search } from "lucide-react";

interface TopbarProps {
  newHref?: string;
  newLabel?: string;
  searchPlaceholder?: string;
}

export function Topbar({
  newHref = "/agenda/nueva",
  newLabel = "Nueva cita",
  searchPlaceholder = "Buscar paciente o cita...",
}: TopbarProps) {
  return (
    <header className="h-16 sticky top-0 z-40 bg-[#f9f9ff] flex items-center justify-between px-6 w-full shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484556]" />
          <input
            className="w-full bg-[#f0f3ff] border border-[#c9c4d9] rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#5427e6]/20 focus:border-[#5427e6] outline-none transition-all text-[#151c27] placeholder:text-[#797588]"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" title="Notificaciones"
          className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556] relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full" />
        </button>
        <button type="button" title="Calendario"
          className="p-2 rounded-full hover:bg-[#e7eefe] transition-colors text-[#484556]">
          <CalendarDays className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-[#c9c4d9] mx-2" />
        <Link href={newHref}
          className="flex items-center gap-2 px-4 py-2 bg-[#5427e6] text-white rounded-full text-sm font-medium hover:bg-[#6d4aff] transition-all active:scale-95 shadow-sm">
          <Plus className="w-4 h-4" />
          {newLabel}
        </Link>
        <div className="ml-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#d9dff5] flex items-center justify-center text-sm font-semibold text-[#5427e6]">
            DR
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-[#151c27]">Dra. Admin</p>
            <p className="text-[10px] text-[#484556]">Director Médico</p>
          </div>
        </div>
      </div>
    </header>
  );
}
