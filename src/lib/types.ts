// Schema real do Supabase (schema da sessão anterior)

export type Patient = {
  id: string;
  clinic_id: string;
  user_id: string | null;
  name: string;
  document: string | null;
  birth_date: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  title: string;
  start_at: string;
  end_at: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  google_event_id: string | null;
  created_at: string;
  patients?: Pick<Patient, "id" | "name" | "phone">;
};

export type Proposal = {
  id: string;
  clinic_id: string;
  patient_id: string;
  procedure_id: string | null;
  template_id: string | null;
  doctor_id: string | null;
  title: string;
  body: string;
  price: number | null;
  payment_status: string;
  status: "draft" | "sent" | "viewed" | "approved" | "signed" | "rejected" | "expired";
  sent_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "name">;
};

export type Control = {
  id: string;
  clinic_id: string;
  patient_id: string;
  type: string;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  patients?: Pick<Patient, "id" | "name">;
};

export type Procedure = {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  estimated_duration_minutes: number | null;
  is_surgical: boolean;
};

export type Consultation = {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id: string | null;
  doctor_id: string | null;
  reason: string | null;
  evaluation: string | null;
  diagnosis: string | null;
  conduct: string | null;
  observations: string | null;
  consulted_at: string;
  created_at: string;
};
