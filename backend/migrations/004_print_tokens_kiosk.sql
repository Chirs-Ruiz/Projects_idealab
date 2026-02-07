ALTER TABLE print_tokens
  ADD COLUMN kiosk_id UUID NOT NULL REFERENCES kiosks(id),
  ADD COLUMN consumed_at TIMESTAMPTZ;

CREATE INDEX idx_print_tokens_kiosk ON print_tokens(kiosk_id);
