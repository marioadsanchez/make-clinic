-- =============================================
-- EXTENSIONS
-- =============================================
create extension if not exists "uuid-ossp";

-- =============================================
-- CLINICS
-- =============================================
create table clinics (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  phone text,
  email text,
  address text,
  city text,
  country text default 'MX',
  timezone text default 'America/Mexico_City',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CLINIC USERS (staff)
-- =============================================
create type clinic_role as enum ('owner', 'doctor', 'secretary', 'assistant');

create table clinic_users (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role clinic_role not null default 'assistant',
  full_name text not null,
  avatar_url text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(clinic_id, user_id)
);

-- =============================================
-- PATIENTS
-- =============================================
create type patient_sex as enum ('male', 'female', 'other');
create type patient_blood_type as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');

create table patients (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  portal_user_id uuid references auth.users(id) on delete set null,

  -- datos personales
  full_name text not null,
  birth_date date,
  sex patient_sex,
  blood_type patient_blood_type default 'unknown',
  photo_url text,

  -- contacto
  phone text,
  email text,
  emergency_contact_name text,
  emergency_contact_phone text,

  -- dirección
  address text,
  city text,
  state text,
  country text,

  -- historial
  allergies text[],
  chronic_conditions text[],
  current_medications text[],
  previous_surgeries text[],
  notes text,

  -- meta
  referral_source text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PROCEDURES (catálogo de procedimientos)
-- =============================================
create table procedures (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  category text,
  description text,
  default_price numeric(10,2),
  duration_minutes int,
  active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- APPOINTMENTS
-- =============================================
create type appointment_status as enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type appointment_type as enum ('consultation', 'follow_up', 'surgery', 'procedure', 'evaluation');

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid references clinic_users(id) on delete set null,

  title text not null,
  type appointment_type default 'consultation',
  status appointment_status default 'scheduled',

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes int generated always as (extract(epoch from (ends_at - starts_at)) / 60) stored,

  notes text,
  google_event_id text,

  created_by uuid references clinic_users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CONSULTATIONS (registro de consultas)
-- =============================================
create table consultations (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  doctor_id uuid references clinic_users(id) on delete set null,

  date timestamptz not null default now(),
  chief_complaint text,
  history text,
  physical_exam text,
  diagnosis text,
  treatment_plan text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- MEDICAL RECORDS (ficha clínica)
-- =============================================
create table medical_records (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,

  -- antecedentes
  family_history text,
  personal_history text,
  surgical_history text,
  gynecological_history text,
  habits text,

  -- evaluación estética
  aesthetic_complaints text,
  desired_procedures text[],
  aesthetic_notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(patient_id)
);

-- =============================================
-- PROPOSAL TEMPLATES
-- =============================================
create table proposal_templates (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  body text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PROPOSALS
-- =============================================
create type proposal_status as enum ('draft', 'sent', 'viewed', 'approved', 'signed', 'rejected', 'expired');

create table proposals (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  template_id uuid references proposal_templates(id) on delete set null,
  created_by uuid references clinic_users(id) on delete set null,

  title text not null,
  body text not null,
  status proposal_status default 'draft',

  total_price numeric(10,2),
  discount numeric(10,2) default 0,
  final_price numeric(10,2),

  valid_until date,
  sent_at timestamptz,
  viewed_at timestamptz,
  approved_at timestamptz,
  signed_at timestamptz,

  pdf_url text,
  signed_pdf_url text,
  public_token uuid default uuid_generate_v4(),

  payment_status text default 'pending',
  payment_notes text,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- items de la propuesta
create table proposal_items (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  procedure_id uuid references procedures(id) on delete set null,
  description text not null,
  quantity int default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) generated always as (quantity * unit_price) stored,
  sort_order int default 0
);

-- =============================================
-- SURGERY CHECKLISTS
-- =============================================
create table surgery_checklists (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  procedure_name text not null,

  pre_op_items jsonb default '[]',
  intra_op_items jsonb default '[]',
  post_op_items jsonb default '[]',

  completed boolean default false,
  completed_at timestamptz,
  completed_by uuid references clinic_users(id) on delete set null,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CONTROLS (seguimiento post-op)
-- =============================================
create type control_status as enum ('pending', 'scheduled', 'completed', 'cancelled');

create table controls (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,

  title text not null,
  due_date date,
  status control_status default 'pending',

  notes text,
  completed_at timestamptz,
  completed_by uuid references clinic_users(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PHOTOS
-- =============================================
create type photo_category as enum ('pre_op', 'post_op', 'control', 'other');

create table photos (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  consultation_id uuid references consultations(id) on delete set null,

  url text not null,
  thumbnail_url text,
  category photo_category default 'other',
  caption text,
  taken_at date,

  uploaded_by uuid references clinic_users(id) on delete set null,
  created_at timestamptz default now()
);

-- =============================================
-- DOCUMENT TEMPLATES
-- =============================================
create table document_templates (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  type text not null,
  body text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- DOCUMENTS
-- =============================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  template_id uuid references document_templates(id) on delete set null,

  title text not null,
  body text not null,
  pdf_url text,
  public_token uuid default uuid_generate_v4(),

  created_by uuid references clinic_users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- CONSENTS
-- =============================================
create table consents (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,

  title text not null,
  body text not null,
  public_token uuid default uuid_generate_v4(),
  pdf_url text,

  created_by uuid references clinic_users(id) on delete set null,
  created_at timestamptz default now()
);

-- =============================================
-- SIGNATURES
-- =============================================
create table signatures (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,

  entity_type text not null, -- 'proposal' | 'consent' | 'document'
  entity_id uuid not null,

  signer_name text not null,
  signer_ip text,
  signer_user_agent text,
  signature_data text, -- base64 canvas
  signed_at timestamptz default now(),

  pdf_url text
);

-- =============================================
-- ACTIVITY LOGS
-- =============================================
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,

  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,

  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index on clinic_users(clinic_id);
create index on clinic_users(user_id);
create index on patients(clinic_id);
create index on patients(portal_user_id);
create index on appointments(clinic_id);
create index on appointments(patient_id);
create index on appointments(starts_at);
create index on consultations(clinic_id);
create index on consultations(patient_id);
create index on proposals(clinic_id);
create index on proposals(patient_id);
create index on proposals(status);
create index on proposals(public_token);
create index on controls(clinic_id);
create index on controls(due_date);
create index on controls(status);
create index on photos(clinic_id);
create index on photos(patient_id);
create index on activity_logs(clinic_id);
create index on activity_logs(created_at desc);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on clinics for each row execute function update_updated_at();
create trigger set_updated_at before update on clinic_users for each row execute function update_updated_at();
create trigger set_updated_at before update on patients for each row execute function update_updated_at();
create trigger set_updated_at before update on appointments for each row execute function update_updated_at();
create trigger set_updated_at before update on consultations for each row execute function update_updated_at();
create trigger set_updated_at before update on medical_records for each row execute function update_updated_at();
create trigger set_updated_at before update on proposal_templates for each row execute function update_updated_at();
create trigger set_updated_at before update on proposals for each row execute function update_updated_at();
create trigger set_updated_at before update on surgery_checklists for each row execute function update_updated_at();
create trigger set_updated_at before update on controls for each row execute function update_updated_at();
create trigger set_updated_at before update on document_templates for each row execute function update_updated_at();
create trigger set_updated_at before update on documents for each row execute function update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table clinics enable row level security;
alter table clinic_users enable row level security;
alter table patients enable row level security;
alter table procedures enable row level security;
alter table appointments enable row level security;
alter table consultations enable row level security;
alter table medical_records enable row level security;
alter table proposal_templates enable row level security;
alter table proposals enable row level security;
alter table proposal_items enable row level security;
alter table surgery_checklists enable row level security;
alter table controls enable row level security;
alter table photos enable row level security;
alter table document_templates enable row level security;
alter table documents enable row level security;
alter table consents enable row level security;
alter table signatures enable row level security;
alter table activity_logs enable row level security;

-- Helper: retorna o clinic_id do usuário autenticado
create or replace function auth_clinic_id()
returns uuid as $$
  select clinic_id from clinic_users
  where user_id = auth.uid() and active = true
  limit 1;
$$ language sql security definer stable;

-- Policies: staff só vê dados da sua clínica
create policy "clinic staff access" on clinics for all using (id = auth_clinic_id());
create policy "clinic staff access" on clinic_users for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on patients for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on procedures for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on appointments for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on consultations for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on medical_records for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on proposal_templates for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on proposals for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on proposal_items for all using (
  proposal_id in (select id from proposals where clinic_id = auth_clinic_id())
);
create policy "clinic staff access" on surgery_checklists for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on controls for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on photos for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on document_templates for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on documents for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on consents for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on signatures for all using (clinic_id = auth_clinic_id());
create policy "clinic staff access" on activity_logs for all using (clinic_id = auth_clinic_id());

-- Paciente pode ver suas próprias propostas/consentimentos via token público (sem auth)
create policy "public proposal view" on proposals for select using (true);
create policy "public consent view" on consents for select using (true);
create policy "public document view" on documents for select using (true);

-- =============================================
-- SEED: clínica demo
-- =============================================
insert into clinics (id, name, slug, country, timezone)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Make Clinic',
  'make-clinic',
  'MX',
  'America/Mexico_City'
);
