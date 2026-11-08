-- Esquema inicial. Los códigos de invitación deben generarse en el servidor con un generador criptográfico.
CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 160),
  invite_code text NOT NULL UNIQUE CHECK (length(invite_code) >= 32),
  companion_allowed boolean NOT NULL DEFAULT false,
  companion_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'declined')),
  companion_attending boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT companion_attending OR (companion_allowed AND status = 'attending')),
  CHECK (companion_allowed OR companion_name IS NULL)
);
