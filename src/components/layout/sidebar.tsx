"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, FileText, FolderOpen, ClipboardCheck, Settings } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
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
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-semibold text-gray-900">{clinicName}</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-gray-200 bg-white">
        {nav.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
