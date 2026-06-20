"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, FileText,
  FolderOpen, ClipboardCheck, Image, Settings, HelpCircle, Sparkles
} from "lucide-react";

const nav = [
  { href: "/",            label: "Inicio",        icon: LayoutDashboard },
  { href: "/agenda",      label: "Agenda",        icon: Calendar },
  { href: "/pacientes",   label: "Pacientes",     icon: Users },
  { href: "/propuestas",  label: "Propuestas",    icon: FileText },
  { href: "/documentos",  label: "Documentos",    icon: FolderOpen },
  { href: "/controles",   label: "Controles",     icon: ClipboardCheck },
  { href: "/fotos",       label: "Fotos",         icon: Image },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

const bottomNav = nav.slice(0, 5);

export function Sidebar({ clinicName }: { clinicName: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-full py-6 px-4 bg-[#f9f9ff] border-r border-[#c9c4d9] w-64 flex-shrink-0">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 px-2">
          <div className="w-12 h-12 rounded-xl bg-[#6d4aff] flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-semibold leading-[1.4] text-[#151c27]">{clinicName}</h1>
            <p className="text-xs text-[#484556] opacity-70">Belleza y Confianza</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium leading-none tracking-[0.01em] ${
                  active
                    ? "text-[#5427e6] font-bold bg-[#e7eefe]"
                    : "text-[#484556] hover:bg-[#e7eefe]"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${active ? "text-[#5427e6]" : "text-[#484556]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-[#c9c4d9]">
          <Link href="/ajuda"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[#e7eefe] text-[#484556] text-[14px] font-medium">
            <HelpCircle className="w-5 h-5" />
            Ayuda
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#c9c4d9] flex items-center justify-around h-16 z-50">
        {bottomNav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium ${active ? "text-[#5427e6]" : "text-[#484556]"}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
