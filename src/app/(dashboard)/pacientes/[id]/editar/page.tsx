"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setFullName(d.full_name ?? "");
        setBirthDate(d.birth_date?.slice(0, 10) ?? "");
        setSex(d.sex ?? "");
        setPhone(d.phone ?? "");
        setEmail(d.email ?? "");
        setAddress(d.address ?? "");
        setCity(d.city ?? "");
        setState(d.state ?? "");
        setEmergencyName(d.emergency_contact_name ?? "");
        setEmergencyPhone(d.emergency_contact_phone ?? "");
        setReferralSource(d.referral_source ?? "");
        setNotes(d.notes ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/pacientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName, birth_date: birthDate, sex, phone, email,
        address, city, state,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        referral_source: referralSource, notes,
      }),
    });

    if (res.ok) {
      router.push(`/pacientes/${id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const f = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const l = "mb-1 block text-sm font-medium text-gray-700";

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-sm text-gray-500">Cargando...</p></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Datos personales</h2>
          <div>
            <label className={l}>Nombre completo *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={f} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={l}>Fecha de nacimiento</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Sexo</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)} className={f}>
                <option value="">Sin especificar</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={l}>Teléfono</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={f} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Dirección</h2>
          <div>
            <label className={l}>Dirección</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={f} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={l}>Ciudad</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Estado / Provincia</label>
              <input value={state} onChange={(e) => setState(e.target.value)} className={f} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Contacto de emergencia</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={l}>Nombre</label>
              <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Teléfono</label>
              <input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={f} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Información adicional</h2>
          <div>
            <label className={l}>Cómo nos conoció</label>
            <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className={f}>
              <option value="">Sin especificar</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="google">Google</option>
              <option value="referral">Recomendación</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className={l}>Notas internas</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones privadas sobre el paciente..." className={f} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href={`/pacientes/${id}`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
