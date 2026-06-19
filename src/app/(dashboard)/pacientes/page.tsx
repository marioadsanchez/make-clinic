import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

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
    .select("id, full_name, birth_date, phone, email, city")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .eq("active", true)
    .order("full_name");

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: patients } = await query.limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <Link href="/pacientes/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Nuevo
        </Link>
      </div>

      <form method="GET" className="relative">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none" />
      </form>

      <div className="rounded-xl border border-gray-200 bg-white">
        {!patients?.length ? (
          <EmptyState icon={Users}
            title={q ? "Sin resultados" : "Sin pacientes"}
            description={q ? `No se encontró "${q}".` : "Registra el primer paciente."}
            action={!q ? (
              <Link href="/pacientes/nuevo"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                + Nuevo Paciente
              </Link>
            ) : undefined}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {patients.map((p) => (
              <Link key={p.id} href={`/pacientes/${p.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {p.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{p.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {[p.birth_date ? calcAge(p.birth_date) : null, p.phone, p.city].filter(Boolean).join(" · ")}
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
