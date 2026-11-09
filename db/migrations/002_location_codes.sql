-- Los códigos se almacenan solo como SHA-256; la dirección permanece en el servidor.
ALTER TABLE guests ADD COLUMN location_code_hash text;
ALTER TABLE guests ADD COLUMN location_issued_at timestamptz;
ALTER TABLE guests ADD COLUMN location_used_at timestamptz;
