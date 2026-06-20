"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Patient = { id: string; full_name: string };

const TEMPLATES = [
  {
    id: "consentimiento_general",
    label: "Consentimiento Informado General",
    body: `CONSENTIMIENTO INFORMADO PARA PROCEDIMIENTO ESTÉTICO

Yo, __________________________________, identificado(a) con documento de identidad N° ___________, en pleno uso de mis facultades mentales, declaro:

1. PROCEDIMIENTO: He sido informado(a) de forma clara y comprensible sobre el procedimiento estético que se me realizará, sus objetivos, beneficios esperados, posibles riesgos y alternativas.

2. RIESGOS: Comprendo que todo procedimiento médico conlleva riesgos, incluyendo pero no limitándose a: reacciones alérgicas, infección, cicatrización anormal, asimetría y complicaciones anestésicas.

3. RESULTADOS: Entiendo que los resultados pueden variar y no se garantizan resultados específicos.

4. FOTOGRAFÍAS: Autorizo la toma de fotografías clínicas para uso médico y seguimiento de mi tratamiento.

5. CONSENTIMIENTO: Habiendo leído y comprendido la información anterior, consiento voluntariamente la realización del procedimiento.

Fecha: _______________________
Firma del paciente: _______________________`,
  },
  {
    id: "consentimiento_anestesia",
    label: "Consentimiento para Anestesia",
    body: `CONSENTIMIENTO PARA PROCEDIMIENTO ANESTÉSICO

Yo, __________________________________, autorizo la aplicación de anestesia necesaria para el procedimiento indicado.

He sido informado(a) sobre:
- Tipo de anestesia a utilizar
- Riesgos asociados al procedimiento anestésico
- Alternativas disponibles
- Importancia de seguir las indicaciones preoperatorias (ayuno, medicamentos)

DECLARACIONES:
□ No tengo alergias conocidas a medicamentos anestésicos
□ He informado sobre todos mis medicamentos actuales
□ He cumplido con las indicaciones de ayuno preoperatorio

Fecha: _______________________
Firma del paciente: _______________________`,
  },
  {
    id: "indicaciones_postoperatorias",
    label: "Indicaciones Postoperatorias",
    body: `INDICACIONES POSTOPERATORIAS

Estimado(a) paciente:

A continuación encontrará las indicaciones que debe seguir tras su procedimiento:

CUIDADOS GENERALES:
• Repose las primeras 24-48 horas
• Evite esfuerzos físicos durante ______ días
• No se exponga al sol directamente durante ______ semanas
• Mantenga la zona operada limpia y seca

MEDICAMENTOS PRESCRITOS:
• ________________________________
• ________________________________

SEÑALES DE ALARMA — Acuda de inmediato si presenta:
• Fiebre mayor a 38°C
• Sangrado excesivo
• Dolor intenso que no cede con analgésicos
• Signos de infección (calor, enrojecimiento, pus)

PRÓXIMA CITA:
Fecha: _______________________
Hora: _______________________

Ante cualquier duda comuníquese al: _______________________`,
  },
  {
    id: "autorizacion_fotos",
    label: "Autorización de Fotografías",
    body: `AUTORIZACIÓN PARA USO DE FOTOGRAFÍAS CLÍNICAS

Yo, __________________________________, autorizo a esta clínica a:

1. Tomar fotografías clínicas de mi caso antes, durante y después del tratamiento.

2. Utilizar dichas fotografías para:
   □ Seguimiento médico de mi tratamiento (siempre autorizado)
   □ Material educativo y formación médica (anónimo)
   □ Publicaciones científicas (anónimo, sin datos identificatorios)
   □ Material de difusión con mi identidad visible (requiere autorización específica)

3. Almacenar las imágenes de forma segura y confidencial.

RESTRICCIONES:
No autorizo el uso de mis fotografías con mi identidad visible en redes sociales u otros medios de comunicación sin mi consentimiento expreso por escrito.

Fecha: _______________________
Firma del paciente: _______________________`,
  },
  { id: "blank", label: "Documento en blanco", body: "" },
];

export default function NuevoDocumentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get("paciente");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(preselectedPatient ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/pacientes/lista").then((r) => r.json()).then(setPatients);
  }, []);

  function applyTemplate(tpl: typeof TEMPLATES[0]) {
    setTitle(tpl.label === "Documento en blanco" ? "" : tpl.label);
    setBody(tpl.body);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patientId, title, body }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/documentos/${data.id}`);
    } else {
      const err = await res.json();
      setError(err.error ?? "Error al guardar");
      setSaving(false);
    }
  }

  const f = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none";
  const l = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/documentos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Documento</h1>
      </div>

      {/* Templates */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-700">Usar plantilla</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-left text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label className={l}>Paciente *</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required className={f}>
              <option value="">Seleccionar paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={l}>Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Ej: Consentimiento informado" className={f} />
          </div>

          <div>
            <label className={l}>Contenido</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16}
              placeholder="Redacta el documento aquí..." className={`${f} font-mono text-xs`} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Link href="/documentos"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : "Crear Documento"}
          </button>
        </div>
      </form>
    </div>
  );
}
