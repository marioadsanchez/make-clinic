import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    .select("*, patients(id, full_name, phone)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const patient = data.patients as { id: string; full_name: string; phone: string | null } | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/documentos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
          {patient && (
            <Link href={`/pacientes/${patient.id}`} className="text-sm text-blue-600 hover:underline">
              {patient.full_name}
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-xs text-gray-400 mb-4">Creado el {formatDate(data.created_at)}</p>
        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{data.body}</div>
      </div>

      {patient?.phone && (
        <a href={`https://wa.me/${patient.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${patient.full_name}, te compartimos el documento: ${data.title}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-medium text-green-700 hover:bg-green-100">
          💬 Enviar por WhatsApp
        </a>
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
