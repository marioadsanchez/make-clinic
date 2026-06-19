import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function DocumentosPage() {
  const supabase = createAdminClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, created_at, pdf_url, patients(id, full_name)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <Link href="/documentos/nuevo"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Nuevo
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {!documents?.length ? (
          <EmptyState icon={FolderOpen} title="Sin documentos"
            description="Crea documentos clínicos y consentimientos."
            action={
              <Link href="/documentos/nuevo"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                + Nuevo Documento
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => {
              const patient = doc.patients as { id: string; full_name: string } | null;
              return (
                <Link key={doc.id} href={`/documentos/${doc.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    {patient && <p className="text-sm text-gray-500">{patient.full_name}</p>}
                    <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                  </div>
                  {doc.pdf_url && <Badge label="PDF" variant="blue" />}
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
