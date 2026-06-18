import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function DocumentosPage() {
  const supabase = createAdminClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, sent_at, archived_at, created_at, patients(id, name)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm text-gray-500">Consentimientos y documentos clínicos</p>
        </div>
        <Link href="/documentos/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Nuevo Documento
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {!documents?.length ? (
          <EmptyState
            icon={FolderOpen}
            title="Sin documentos"
            description="Crea consentimientos y documentos para tus pacientes."
            action={
              <Link href="/documentos/nuevo"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                + Nuevo Documento
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((d) => {
              const patient = d.patients as { id: string; name: string } | null;
              const status = d.archived_at ? "archived" : d.sent_at ? "sent" : "draft";
              const statusCfg = {
                draft: { label: "Borrador", variant: "gray" as const },
                sent: { label: "Enviado", variant: "blue" as const },
                archived: { label: "Archivado", variant: "green" as const },
              }[status];

              return (
                <Link key={d.id} href={`/documentos/${d.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{d.name}</p>
                      <Badge label={statusCfg.label} variant={statusCfg.variant} />
                    </div>
                    {patient && (
                      <p className="mt-0.5 text-sm text-gray-500">{patient.name}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(d.created_at)}</p>
                  </div>
                  <span className="text-gray-400">›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
