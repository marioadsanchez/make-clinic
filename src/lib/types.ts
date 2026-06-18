export type Patient = {
  id: string;
  clinic_id: string;
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
  created_at: string;
  patients?: Pick<Patient, "id" | "full_name" | "phone">;
};

export type Proposal = {
  id: string;
  clinic_id: string;
  patient_id: string;
  title: string;
  body: string;
  status: "draft" | "sent" | "viewed" | "approved" | "signed" | "rejected" | "expired";
  total_price: number | null;
  discount: number | null;
  final_price: number | null;
  valid_until: string | null;
  sent_at: string | null;
  signed_at: string | null;
  pdf_url: string | null;
  public_token: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  patients?: Pick<Patient, "id" | "full_name">;
};

export type Control = {
  id: string;
  clinic_id: string;
  patient_id: string;
  title: string;
  due_date: string | null;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
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
};
