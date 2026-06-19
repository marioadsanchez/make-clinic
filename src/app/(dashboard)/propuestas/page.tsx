import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Proposal } from "@/lib/types";

export const runtime = "edge";

const columns: { key: Proposal["status"]; label: string; color: string }[] = [
  { key: "draft",    label: "Borrador",   color: "bg-gray-100 text-gray-600" },
  { key: "sent",     label: "Enviada",    color: "bg-blue-100 text-blue-700" },
  { key: "viewed",   label: "Vista",      color: "bg-yellow-100 text-yellow-700" },
  { key: "approved", label: "Aprobada",   color: "bg-green-100 text-green-700" },
  { key: "signed",   label: "Firmada",    color: "bg-emerald-100 text-emerald-700" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export default async function PropuestasPage() {
  const supabase = createAdminClient();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, status, final_price, total_price, created_at, patients(id, full_name)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .not("status", "in", "(rejected,expired)")
    .order("created_at", { ascending: false });

  const grouped = columns.map((col) => ({
    ...col,
    items: (proposals ?? []).filter((p) => p.status === col.key),
  }));

  const total = proposals?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propuestas</h1>
        <Link href="/propuestas/nueva"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Nueva
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState icon={FileText} title="Sin propuestas"
          description="Crea tu primera propuesta comercial."
          action={
            <Link href="/propuestas/nueva"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              + Nueva Propuesta
            </Link>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {grouped.map((col) => (
            <div key={col.key} className="w-72 shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col.color}`}>{col.label}</span>
                <span className="text-xs text-gray-400">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((p) => {
                  const patient = p.patients as { id: string; full_name: string } | null;
                  const price = p.final_price ?? p.total_price;
                  return (
                    <Link key={p.id} href={`/propuestas/${p.id}`}
                      className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                      <p className="font-medium text-gray-900 text-sm leading-tight">{p.title}</p>
                      {patient && (
                        <p className="mt-1 text-xs text-gray-500">{patient.full_name}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {price ? (
                          <p className="text-sm font-semibold text-gray-900">${price.toLocaleString("es-MX")}</p>
                        ) : <span />}
                        <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                      </div>
                    </Link>
                  );
                })}
                {col.items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
                    <p className="text-xs text-gray-400">Sin propuestas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
