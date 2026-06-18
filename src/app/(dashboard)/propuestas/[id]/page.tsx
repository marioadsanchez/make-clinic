import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Proposal, Patient } from "@/lib/types";

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

const nextStatus: Record<string, string> = {
  draft: "sent", sent: "approved", approved: "signed",
};
const nextStatusLabel: Record<string, string> = {
  draft: "Marcar como Enviada", sent: "Marcar como Aprobada", approved: "Marcar como Firmada",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("proposals")
    .select("*, patients(id, name, phone, whatsapp, email)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const p = data as Proposal & { patients: Patient | null };
  const cfg = statusConfig[p.status] ?? { label: p.status, variant: "gray" as const };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/propuestas" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
            <Badge label={cfg.label} variant={cfg.variant} />
          </div>
          {p.patients && (
            <Link href={`/pacientes/${p.patients.id}`}
              className="text-sm text-blue-600 hover:underline">
              {p.patients.name}
            </Link>
          )}
        </div>
      </div>

      {/* Precio y fechas */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Precio</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {p.price ? `$${p.price.toLocaleString("es-MX")}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Creada</p>
            <p className="mt-1 text-sm text-gray-900">{formatDate(p.created_at)}</p>
          </div>
          {p.expires_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Válida hasta</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(p.expires_at)}</p>
            </div>
          )}
          {p.sent_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Enviada</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(p.sent_at)}</p>
            </div>
          )}
          {p.signed_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Firmada</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(p.signed_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Detalle</h2>
        <div className="whitespace-pre-wrap text-sm text-gray-700">{p.body}</div>
      </div>

      {/* Contacto del paciente */}
      {p.patients && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Paciente</h2>
          <div className="flex flex-wrap gap-3">
            {p.patients.phone && (
              <a href={`tel:${p.patients.phone}`}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                📞 {p.patients.phone}
              </a>
            )}
            {p.patients.whatsapp && (
              <a href={`https://wa.me/${p.patients.whatsapp.replace(/\D/g, "")}?text=Hola, te comparto la propuesta: ${p.title}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100">
                💬 Enviar por WhatsApp
              </a>
            )}
            {p.patients.email && (
              <a href={`mailto:${p.patients.email}?subject=${encodeURIComponent(p.title)}`}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                ✉️ {p.patients.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {nextStatus[p.status] && (
          <form action={`/api/propuestas/${id}/status`} method="POST" className="flex-1">
            <input type="hidden" name="status" value={nextStatus[p.status]} />
            <button type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {nextStatusLabel[p.status]}
            </button>
          </form>
        )}
        {p.status !== "rejected" && p.status !== "signed" && (
          <form action={`/api/propuestas/${id}/status`} method="POST">
            <input type="hidden" name="status" value="rejected" />
            <button type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Rechazar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
