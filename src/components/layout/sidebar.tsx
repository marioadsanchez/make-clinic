"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, FileText, FolderOpen, ClipboardCheck, Settings, Heart } from "lucide-react";

const nav = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/propuestas", label: "Propuestas", icon: FileText },
  { href: "/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/controles", label: "Controles", icon: ClipboardCheck },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({ clinicName }: { clinicName: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white border-r border-[#e5e7eb]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#e5e7eb]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5427e6]">
            <Heart className="h-4 w-4 text-white" fill="white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#151c27] truncate">{clinicName}</p>
            <p className="text-[11px] text-[#797588]">Belleza y Confianza</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#f0f3ff] text-[#5427e6]"
                    : "text-[#484556] hover:bg-[#f9f9ff] hover:text-[#151c27]"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-[#5427e6]" : "text-[#797588]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb] p-3">
          <Link href="/configuracion"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#797588] hover:bg-[#f9f9ff] hover:text-[#151c27] transition-colors">
            <Settings className="h-3.5 w-3.5" />
            Ayuda
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-[#e5e7eb]">
        {nav.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#5427e6]" : "text-[#797588]"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-[#5427e6]" : "text-[#797588]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
