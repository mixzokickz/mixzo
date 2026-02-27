-- Run this in Supabase SQL Editor for MixzoKickz (afmtwymcqprwaukkpfta)
-- StockX OAuth token storage

CREATE TABLE IF NOT EXISTS stockx_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token text NOT NULL,
  refresh_token text DEFAULT '',
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz NOT NULL,
  scope text,
  created_at timestamptz DEFAULT now()
);

-- Also add discount_percent column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price numeric;
