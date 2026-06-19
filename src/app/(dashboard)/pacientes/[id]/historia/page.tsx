"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

type Params = { id: string };

export default function HistoriaPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patientName, setPatientName] = useState("");

  // Patient fields
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");

  // Medical record fields
  const [familyHistory, setFamilyHistory] = useState("");
  const [personalHistory, setPersonalHistory] = useState("");
  const [surgicalHistory, setSurgicalHistory] = useState("");
  const [gynecologicalHistory, setGynecologicalHistory] = useState("");
  const [habits, setHabits] = useState("");
  const [aestheticComplaints, setAestheticComplaints] = useState("");
  const [aestheticNotes, setAestheticNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pacientes/${id}/historia`);
        if (!res.ok) return;
        const data = await res.json();
        setPatientName(data.patient?.full_name ?? "");
        setAllergies((data.patient?.allergies ?? []).join(", "));
        setChronicConditions((data.patient?.chronic_conditions ?? []).join(", "));
        setCurrentMedications((data.patient?.current_medications ?? []).join(", "));
        const mr = data.medical_record ?? {};
        setFamilyHistory(mr.family_history ?? "");
        setPersonalHistory(mr.personal_history ?? "");
        setSurgicalHistory(mr.surgical_history ?? "");
        setGynecologicalHistory(mr.gynecological_history ?? "");
        setHabits(mr.habits ?? "");
        setAestheticComplaints(mr.aesthetic_complaints ?? "");
        setAestheticNotes(mr.aesthetic_notes ?? "");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

    const res = await fetch(`/api/pacientes/${id}/historia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allergies: splitList(allergies),
        chronic_conditions: splitList(chronicConditions),
        current_medications: splitList(currentMedications),
        family_history: familyHistory || null,
        personal_history: personalHistory || null,
        surgical_history: surgicalHistory || null,
        gynecological_history: gynecologicalHistory || null,
        habits: habits || null,
        aesthetic_complaints: aestheticComplaints || null,
        aesthetic_notes: aestheticNotes || null,
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

  const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const label = "mb-1 block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historia Clínica</h1>
          {patientName && <p className="text-sm text-gray-500">{patientName}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Antecedentes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Antecedentes</h2>
          <p className="text-xs text-gray-400">Separa múltiples valores con coma. Ej: Penicilina, Ibuprofeno</p>

          <div>
            <label htmlFor="allergies" className={label}>Alergias</label>
            <input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ej: Penicilina, látex" className={field} />
          </div>

          <div>
            <label htmlFor="chronic" className={label}>Condiciones crónicas</label>
            <input id="chronic" value={chronicConditions} onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="Ej: Diabetes tipo 2, hipertensión" className={field} />
          </div>

          <div>
            <label htmlFor="meds" className={label}>Medicamentos actuales</label>
            <input id="meds" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="Ej: Metformina 500mg, Losartán" className={field} />
          </div>

          <div>
            <label htmlFor="surgical" className={label}>Cirugías previas</label>
            <textarea id="surgical" rows={2} value={surgicalHistory} onChange={(e) => setSurgicalHistory(e.target.value)}
              placeholder="Ej: Apendicectomía 2010, cesárea 2015" className={field} />
          </div>
        </div>

        {/* Antecedentes familiares y personales */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Historia Personal y Familiar</h2>

          <div>
            <label htmlFor="family" className={label}>Antecedentes familiares</label>
            <textarea id="family" rows={2} value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)}
              placeholder="Enfermedades hereditarias, antecedentes relevantes..." className={field} />
          </div>

          <div>
            <label htmlFor="personal" className={label}>Antecedentes personales</label>
            <textarea id="personal" rows={2} value={personalHistory} onChange={(e) => setPersonalHistory(e.target.value)}
              placeholder="Enfermedades pasadas relevantes..." className={field} />
          </div>

          <div>
            <label htmlFor="gyneco" className={label}>Antecedentes ginecológicos</label>
            <textarea id="gyneco" rows={2} value={gynecologicalHistory} onChange={(e) => setGynecologicalHistory(e.target.value)}
              placeholder="Ciclos, embarazos, menopausia..." className={field} />
          </div>

          <div>
            <label htmlFor="habits" className={label}>Hábitos</label>
            <textarea id="habits" rows={2} value={habits} onChange={(e) => setHabits(e.target.value)}
              placeholder="Tabaco, alcohol, ejercicio, alimentación..." className={field} />
          </div>
        </div>

        {/* Evaluación estética */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Evaluación Estética</h2>

          <div>
            <label htmlFor="complaints" className={label}>Motivo / Queja estética</label>
            <textarea id="complaints" rows={3} value={aestheticComplaints} onChange={(e) => setAestheticComplaints(e.target.value)}
              placeholder="¿Qué desea mejorar o corregir el paciente?" className={field} />
          </div>

          <div>
            <label htmlFor="aesthetic_notes" className={label}>Notas de evaluación</label>
            <textarea id="aesthetic_notes" rows={3} value={aestheticNotes} onChange={(e) => setAestheticNotes(e.target.value)}
              placeholder="Observaciones clínicas, expectativas, recomendaciones..." className={field} />
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
            {saving ? "Guardando..." : "Guardar Historia"}
          </button>
        </div>
      </form>
    </div>
  );
}
