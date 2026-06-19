export type Clinic = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type ClinicUser = {
  id: string;
  clinic_id: string;
  user_id: string;
  role: "owner" | "doctor" | "secretary" | "assistant";
  full_name: string;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
};

export type Patient = {
  id: string;
  clinic_id: string;
  portal_user_id: string | null;
  full_name: string;
  birth_date: string | null;
  sex: "male" | "female" | "other" | null;
  blood_type: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  current_medications: string[] | null;
  previous_surgeries: string[] | null;
  notes: string | null;
  referral_source: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicalRecord = {
  id: string;
  clinic_id: string;
  patient_id: string;
  family_history: string | null;
  personal_history: string | null;
  surgical_history: string | null;
  gynecological_history: string | null;
  habits: string | null;
  aesthetic_complaints: string | null;
  desired_procedures: string[] | null;
  aesthetic_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  title: string;
  type: "consultation" | "follow_up" | "surgery" | "procedure" | "evaluation";
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  starts_at: string;
  ends_at: string;
  duration_minutes: number | null;
  notes: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "full_name" | "phone">;
};

export type Consultation = {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id: string | null;
  doctor_id: string | null;
  date: string;
  chief_complaint: string | null;
  history: string | null;
  physical_exam: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Proposal = {
  id: string;
  clinic_id: string;
  patient_id: string;
  template_id: string | null;
  created_by: string | null;
  title: string;
  body: string;
  status: "draft" | "sent" | "viewed" | "approved" | "signed" | "rejected" | "expired";
  total_price: number | null;
  discount: number | null;
  final_price: number | null;
  valid_until: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  approved_at: string | null;
  signed_at: string | null;
  pdf_url: string | null;
  signed_pdf_url: string | null;
  public_token: string | null;
  payment_status: string;
  payment_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "full_name">;
};

export type ProposalItem = {
  id: string;
  proposal_id: string;
  procedure_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
};

export type Control = {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id: string | null;
  title: string;
  due_date: string | null;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "full_name">;
};

export type Procedure = {
  id: string;
  clinic_id: string;
  name: string;
  category: string | null;
  description: string | null;
  default_price: number | null;
  duration_minutes: number | null;
  active: boolean;
  created_at: string;
};

export type Photo = {
  id: string;
  clinic_id: string;
  patient_id: string;
  consultation_id: string | null;
  url: string;
  thumbnail_url: string | null;
  category: "pre_op" | "post_op" | "control" | "other";
  caption: string | null;
  taken_at: string | null;
  created_at: string;
};

export type DocumentTemplate = {
  id: string;
  clinic_id: string;
  name: string;
  type: string;
  body: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  clinic_id: string;
  patient_id: string;
  template_id: string | null;
  title: string;
  body: string;
  pdf_url: string | null;
  public_token: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "full_name">;
};

export type ProposalTemplate = {
  id: string;
  clinic_id: string;
  name: string;
  body: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};
