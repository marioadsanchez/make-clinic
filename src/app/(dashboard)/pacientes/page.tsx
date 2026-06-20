import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { Users, Plus, Phone } from "lucide-react";

export const runtime = "edge";

const avatarColors = [
  "bg-[#f0f3ff] text-[#5427e6]",
  "bg-[#dcfce7] text-[#16a34a]",
  "bg-[#fef9c3] text-[#a16207]",
  "bg-[#e7eefe] text-[#484556]",
  "bg-[#ffdad6] text-[#93000a]",
];

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#151c27]">Pacientes</h1>
          <p className="text-sm text-[#797588]">{patients?.length ?? 0} pacientes activos</p>
        </div>
        <Link href="/pacientes/nuevo" className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo
        </Link>
      </div>

      <form method="GET">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre..."
          className="field" />
      </form>

      <div className="card overflow-hidden">
        {!patients?.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f3ff] mb-4">
              <Users className="h-7 w-7 text-[#5427e6]" />
            </div>
            <h3 className="font-semibold text-[#151c27]">{q ? "Sin resultados" : "Sin pacientes"}</h3>
            <p className="mt-1 text-sm text-[#797588]">{q ? `No se encontró "${q}".` : "Registra el primer paciente."}</p>
            {!q && (
              <Link href="/pacientes/nuevo" className="btn-primary mt-4">
                <Plus className="h-4 w-4" /> Nuevo paciente
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#f0f3ff]">
            {patients.map((p, i) => (
              <Link key={p.id} href={`/pacientes/${p.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#f9f9ff] transition-colors">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColors[i % avatarColors.length]}`}>
                  {p.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#151c27] truncate">{p.full_name}</p>
                  <p className="text-xs text-[#797588] truncate">{p.email ?? p.city ?? "—"}</p>
                </div>
                {p.phone && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#484556]">
                    <Phone className="h-3.5 w-3.5" />{p.phone}
                  </span>
                )}
                <span className="text-[#c9c4d9]">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
