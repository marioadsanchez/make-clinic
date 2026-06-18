import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Building2, Stethoscope, FileText } from "lucide-react";

export const runtime = "edge";

export default async function ConfiguracionPage() {
  const supabase = createAdminClient();
  const { data: clinic } = await supabase
    .from("clinics")
    .select("name, email, phone, address")
    .eq("id", DEMO_CLINIC_ID)
    .single();

  const sections = [
    {
      href: "/configuracion/clinica",
      icon: Building2,
      title: "Datos de la Clínica",
      description: clinic?.name ?? "Configura nombre, contacto y dirección",
    },
    {
      href: "/configuracion/procedimientos",
      icon: Stethoscope,
      title: "Procedimientos",
      description: "Catálogo de procedimientos y precios base",
    },
    {
      href: "/configuracion/plantillas",
      icon: FileText,
      title: "Plantillas de Propuestas",
      description: "Textos reutilizables para propuestas comerciales",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">Administra los datos de tu clínica</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <s.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{s.title}</p>
              <p className="mt-1 text-sm text-gray-500">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
