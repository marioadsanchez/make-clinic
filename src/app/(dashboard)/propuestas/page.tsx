import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Proposal } from "@/lib/types";

export const runtime = "edge";

const statusConfig: Record<string, { label: string; variant: "gray" | "blue" | "green" | "yellow" | "red" | "purple" }> = {
  draft:    { label: "Borrador",  variant: "gray" },
  sent:     { label: "Enviada",   variant: "blue" },
  viewed:   { label: "Vista",     variant: "yellow" },
  approved: { label: "Aprobada",  variant: "green" },
  signed:   { label: "Firmada",   variant: "purple" },
  rejected: { label: "Rechazada", variant: "red" },
  expired:  { label: "Expirada",  variant: "red" },
};

const columns = ["draft", "sent", "viewed", "approved", "signed"];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export default async function PropuestasPage() {
  const supabase = createAdminClient();

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, title, status, price, created_at, patients(id, name)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .not("status", "in", '("rejected","expired")')
    .order("created_at", { ascending: false });

  const grouped = columns.reduce((acc, col) => {
    acc[col] = (proposals ?? []).filter((p) => p.status === col) as Proposal[];
    return acc;
  }, {} as Record<string, Proposal[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propuestas</h1>
          <p className="text-sm text-gray-500">Pipeline comercial</p>
        </div>
        <Link href="/propuestas/nueva"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Nueva Propuesta
        </Link>
      </div>

      {!proposals?.length ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={FileText}
            title="Sin propuestas"
            description="Crea tu primera propuesta comercial."
            action={
              <Link href="/propuestas/nueva"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                + Nueva Propuesta
              </Link>
            }
          />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const cfg = statusConfig[col];
            return (
              <div key={col} className="flex w-72 shrink-0 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge label={cfg.label} variant={cfg.variant} />
                  <span className="text-sm text-gray-500">{grouped[col].length}</span>
                </div>
                {grouped[col].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                    Sin propuestas
                  </div>
                ) : (
                  grouped[col].map((p) => {
                    const patient = p.patients as { id: string; name: string } | null;
                    return (
                      <Link key={p.id} href={`/propuestas/${p.id}`}
                        className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                        <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                        {patient && (
                          <p className="mt-1 text-xs text-gray-500">{patient.name}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          {p.price ? (
                            <span className="text-sm font-semibold text-gray-900">
                              ${p.price.toLocaleString("es-MX")}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Sin precio</span>
                          )}
                          <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
