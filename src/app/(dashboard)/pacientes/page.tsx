import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Patient } from "@/lib/types";

export const runtime = "edge";

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "";
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + " años";
}

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("patients")
    .select("id, name, phone, whatsapp, email, birth_date, address")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("name");

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: patients } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500">
            {patients?.length ?? 0} paciente{patients?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nuevo Paciente
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <form method="GET">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {!patients?.length ? (
          <EmptyState
            icon={Users}
            title="Sin pacientes"
            description={q ? "No se encontraron resultados." : "Agrega tu primer paciente."}
            action={
              !q ? (
                <Link
                  href="/pacientes/nuevo"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + Nuevo Paciente
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {(patients as Patient[]).map((p) => (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{p.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {p.phone ?? p.whatsapp ?? p.email ?? "Sin contacto"}
                    {p.birth_date ? ` · ${calcAge(p.birth_date)}` : ""}
                  </p>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
