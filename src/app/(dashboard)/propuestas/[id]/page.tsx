import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnviarButton } from "@/components/propuesta/enviar-button";
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
    .select("*, patients(id, full_name, phone, email)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const p = data as Proposal & { patients: { id: string; full_name: string; phone: string | null; email: string | null } | null };
  const cfg = statusConfig[p.status] ?? { label: p.status, variant: "gray" as const };
  const price = p.final_price ?? p.total_price;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/propuestas" className="text-[#797588] hover:text-[#484556]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#151c27]">{p.title}</h1>
            <Badge label={cfg.label} variant={cfg.variant} />
          </div>
          {p.patients && (
            <Link href={`/pacientes/${p.patients.id}`} className="text-sm text-[#5427e6] hover:underline">
              {p.patients.full_name}
            </Link>
          )}
        </div>
        <Link href={`/propuestas/${id}/editar`} className="btn-secondary flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Link>
      </div>

      {/* Precio y fechas */}
      <div className="card card-p">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Precio</p>
            <p className="mt-1 text-2xl font-bold text-[#151c27]">
              {price ? `$${price.toLocaleString("es-MX")}` : "—"}
            </p>
          </div>
          {p.discount ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Descuento</p>
              <p className="mt-1 text-sm text-[#151c27]">${p.discount.toLocaleString("es-MX")}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Creada</p>
            <p className="mt-1 text-sm text-[#151c27]">{formatDate(p.created_at)}</p>
          </div>
          {p.valid_until && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Válida hasta</p>
              <p className="mt-1 text-sm text-[#151c27]">{formatDate(p.valid_until)}</p>
            </div>
          )}
          {p.sent_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Enviada</p>
              <p className="mt-1 text-sm text-[#151c27]">{formatDate(p.sent_at)}</p>
            </div>
          )}
          {p.signed_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#797588]">Firmada</p>
              <p className="mt-1 text-sm text-[#151c27]">{formatDate(p.signed_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="card card-p">
        <h2 className="mb-4 font-semibold text-[#151c27]">Detalle</h2>
        <div className="whitespace-pre-wrap text-sm text-[#484556] leading-relaxed">{p.body}</div>
      </div>

      {/* Contacto del paciente */}
      {p.patients && (
        <div className="card card-p">
          <h2 className="mb-3 font-semibold text-[#151c27]">Paciente</h2>
          <div className="flex flex-wrap gap-3">
            {p.patients.phone && (
              <a href={`tel:${p.patients.phone}`}
                className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#484556] hover:bg-[#f9f9ff]">
                📞 {p.patients.phone}
              </a>
            )}
            {p.patients.phone && (
              <a href={`https://wa.me/${p.patients.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, te comparto la propuesta: ${p.title}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100">
                💬 WhatsApp
              </a>
            )}
            {p.patients.email && (
              <a href={`mailto:${p.patients.email}?subject=${encodeURIComponent(p.title)}`}
                className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#484556] hover:bg-[#f9f9ff]">
                ✉️ {p.patients.email}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Portal de firma */}
      {p.status !== "signed" && p.status !== "rejected" && (
        <EnviarButton
          proposalId={id}
          publicToken={p.public_token ?? null}
          patientPhone={p.patients?.phone ?? null}
        />
      )}

      {/* Acciones de estado */}
      <div className="flex flex-wrap gap-3">
        {nextStatus[p.status] && (
          <form action={`/api/propuestas/${id}/status`} method="POST" className="flex-1">
            <input type="hidden" name="status" value={nextStatus[p.status]} />
            <button type="submit" className="btn-secondary w-full">
              {nextStatusLabel[p.status]}
            </button>
          </form>
        )}
        {p.status !== "rejected" && p.status !== "signed" && (
          <form action={`/api/propuestas/${id}/status`} method="POST">
            <input type="hidden" name="status" value="rejected" />
            <button type="submit" className="btn-danger">
              Rechazar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
