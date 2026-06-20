import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { CheckCircle, Clock, Calendar, Plus } from "lucide-react";
import { DEMO_CLINIC_ID } from "@/lib/constants";

export const runtime = "edge";

function formatDate(d: string | null) {
  if (!d) return "Sin fecha";
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(due: string | null) {
  if (!due) return false;
  return new Date(due) < new Date();
}

export default async function ControlesPage() {
  const supabase = createAdminClient();
  const { data: controls } = await supabase
    .from("controls")
    .select("*, patients(id, full_name, phone)")
    .eq("clinic_id", DEMO_CLINIC_ID)
    .neq("status", "cancelled")
    .order("due_date", { ascending: true, nullsFirst: false });

  const pending = (controls ?? []).filter((c) => c.status === "pending" || c.status === "scheduled");
  const completed = (controls ?? []).filter((c) => c.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#151c27]">Controles</h1>
        <Link href="/controles/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuevo Control
        </Link>
      </div>

      {/* Pendientes */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#797588]">
          Pendientes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5e7eb] bg-white p-8 text-center">
            <p className="text-sm text-[#797588]">No hay controles pendientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((c) => {
              const overdue = isOverdue(c.due_date);
              return (
                <div key={c.id}
                  className={`flex items-start gap-4 rounded-xl border bg-white p-4 ${overdue ? "border-red-200" : "border-[#e5e7eb]"}`}>
                  <div className={`mt-0.5 rounded-full p-1.5 ${overdue ? "bg-red-50" : "bg-[#f0f3ff]"}`}>
                    <Clock className={`h-4 w-4 ${overdue ? "text-red-500" : "text-[#5427e6]"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#151c27]">{c.title}</p>
                    {c.patients && (
                      <Link href={`/pacientes/${c.patients.id}`}
                        className="text-sm text-[#5427e6] hover:underline">
                        {c.patients.full_name}
                      </Link>
                    )}
                    {c.notes && <p className="mt-1 text-xs text-[#797588]">{c.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? "text-red-500" : "text-[#797588]"}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(c.due_date)}
                    </span>
                    <form action={`/api/controles/${c.id}/completar`} method="POST">
                      <Link href={`/controles/${c.id}/completar`}
                        className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100">
                        Completar
                      </Link>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completados recientes */}
      {completed.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#797588]">
            Completados recientes
          </h2>
          <div className="space-y-2">
            {completed.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-4 rounded-xl border border-[#f0f3ff] bg-[#f9f9ff] p-4 opacity-70">
                <div className="mt-0.5 rounded-full bg-green-50 p-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#484556] line-through">{c.title}</p>
                  {c.patients && <p className="text-sm text-[#797588]">{c.patients.full_name}</p>}
                </div>
                <span className="text-xs text-[#797588]">{formatDate(c.completed_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
