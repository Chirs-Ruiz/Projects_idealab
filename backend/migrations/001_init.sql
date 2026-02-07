CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE print_job_status AS ENUM (
  'uploaded',
  'otp_verified',
  'payment_pending',
  'paid',
  'printing',
  'printed',
  'failed',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded'
);

CREATE TYPE otp_purpose AS ENUM (
  'upload_verification',
  'print_release'
);

CREATE TYPE otp_status AS ENUM (
  'pending',
  'verified',
  'expired'
);

CREATE TABLE kiosks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id UUID NOT NULL REFERENCES kiosks(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  file_id UUID NOT NULL REFERENCES files(id),
  status print_job_status NOT NULL,
  copies INTEGER NOT NULL DEFAULT 1,
  amount_paise INTEGER NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_job_id UUID NOT NULL REFERENCES print_jobs(id),
  provider TEXT NOT NULL,
  provider_order_id TEXT NOT NULL,
  provider_payment_id TEXT,
  amount_paise INTEGER NOT NULL,
  status payment_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  otp_code TEXT NOT NULL,
  purpose otp_purpose NOT NULL,
  status otp_status NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE print_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_job_id UUID NOT NULL REFERENCES print_jobs(id),
  token TEXT NOT NULL UNIQUE,
  fallback_otp TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_print_jobs_kiosk ON print_jobs(kiosk_id);
CREATE INDEX idx_payments_job ON payments(print_job_id);
CREATE INDEX idx_otp_sessions_customer ON otp_sessions(customer_id);
CREATE INDEX idx_print_tokens_job ON print_tokens(print_job_id);
