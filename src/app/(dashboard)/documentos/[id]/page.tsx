import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const runtime = "edge";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("documents")
    .select("*, patients(id, name, phone, whatsapp)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const status = data.archived_at ? "archived" : data.sent_at ? "sent" : "draft";
  const statusCfg = {
    draft:    { label: "Borrador",  variant: "gray" as const },
    sent:     { label: "Enviado",   variant: "blue" as const },
    archived: { label: "Archivado", variant: "green" as const },
  }[status];

  const patient = data.patients as { id: string; name: string; phone: string | null; whatsapp: string | null } | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/documentos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
            <Badge label={statusCfg.label} variant={statusCfg.variant} />
          </div>
          {patient && (
            <Link href={`/pacientes/${patient.id}`} className="text-sm text-blue-600 hover:underline">
              {patient.name}
            </Link>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Creado</p>
            <p className="mt-1 text-gray-900">{formatDate(data.created_at)}</p>
          </div>
          {data.sent_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Enviado</p>
              <p className="mt-1 text-gray-900">{formatDate(data.sent_at)}</p>
            </div>
          )}
          {data.archived_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Archivado</p>
              <p className="mt-1 text-gray-900">{formatDate(data.archived_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Contenido</h2>
        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{data.body}</div>
      </div>

      {/* Acciones */}
      {patient && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Enviar al Paciente</h2>
          <div className="flex flex-wrap gap-3">
            {patient.whatsapp && (
              <a
                href={`https://wa.me/${patient.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${patient.name}, te compartimos el documento: ${data.name}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                💬 Enviar por WhatsApp
              </a>
            )}
            {patient.phone && (
              <a href={`tel:${patient.phone}`}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                📞 Llamar
              </a>
            )}
          </div>
        </div>
      )}

      {data.pdf_url && (
        <a href={data.pdf_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100">
          📄 Ver PDF
        </a>
      )}
    </div>
  );
}
