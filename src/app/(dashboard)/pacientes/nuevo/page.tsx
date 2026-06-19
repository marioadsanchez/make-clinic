"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      full_name: form.get("full_name"),
      birth_date: form.get("birth_date") || null,
      sex: form.get("sex") || null,
      phone: form.get("phone") || null,
      email: form.get("email") || null,
      city: form.get("city") || null,
      referral_source: form.get("referral_source") || null,
      notes: form.get("notes") || null,
    };

    const res = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/pacientes/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al crear el paciente");
      setLoading(false);
    }
  }

  const field = "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none w-full";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Datos Personales</h2>

          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-gray-700">Nombre completo *</label>
            <input id="full_name" name="full_name" required placeholder="Ej. María García López" className={field} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="birth_date" className="mb-1 block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
              <input id="birth_date" name="birth_date" type="date" title="Fecha de nacimiento" className={field} />
            </div>
            <div>
              <label htmlFor="sex" className="mb-1 block text-sm font-medium text-gray-700">Sexo</label>
              <select id="sex" name="sex" title="Sexo" className={field}>
                <option value="">— Seleccionar —</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Contacto</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
              <input id="phone" name="phone" type="tel" placeholder="+52 55 1234 5678" className={field} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" name="email" type="email" placeholder="correo@ejemplo.com" className={field} />
            </div>
          </div>

          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
            <input id="city" name="city" placeholder="Ej. Ciudad de México" className={field} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Otros</h2>

          <div>
            <label htmlFor="referral_source" className="mb-1 block text-sm font-medium text-gray-700">¿Cómo nos conoció?</label>
            <select id="referral_source" name="referral_source" title="Fuente de referido" className={field}>
              <option value="">— Seleccionar —</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="referido">Referido</option>
              <option value="google">Google</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">Notas internas</label>
            <textarea id="notes" name="notes" rows={3} placeholder="Observaciones internas..." className={field} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href="/pacientes"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Guardando..." : "Crear Paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}
