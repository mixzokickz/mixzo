-- ============================================
-- MixzoKickz Raffle System — Database Schema
-- ============================================

-- Raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  title text NOT NULL,
  description text,
  entry_price numeric(10,2) NOT NULL,
  max_entries integer, -- null = unlimited
  entries_per_person integer DEFAULT 1,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'drawing', 'completed', 'cancelled')),
  winner_id uuid,
  winner_announced_at timestamptz,
  product_name text,
  product_image text,
  product_size text,
  product_retail_price numeric(10,2),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Raffle entries table
CREATE TABLE IF NOT EXISTS raffle_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid REFERENCES raffles(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  stripe_payment_id text,
  stripe_session_id text,
  entry_number integer NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'winner', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for winner_id after raffle_entries exists
ALTER TABLE raffles ADD CONSTRAINT raffles_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES raffle_entries(id);

-- Unique constraint on entry number per raffle
ALTER TABLE raffle_entries ADD CONSTRAINT raffle_entries_raffle_entry_unique UNIQUE (raffle_id, entry_number);

-- Index for looking up entries by email within a raffle
CREATE INDEX IF NOT EXISTS idx_raffle_entries_raffle_email ON raffle_entries (raffle_id, customer_email);

-- Index for active raffles
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles (status);

-- Index for featured raffles
CREATE INDEX IF NOT EXISTS idx_raffles_featured ON raffles (featured) WHERE featured = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_raffles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raffles_updated_at
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION update_raffles_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

-- Public can read active/completed raffles
CREATE POLICY "Public can read active raffles"
  ON raffles FOR SELECT
  USING (status IN ('active', 'completed', 'drawing'));

-- Public can read raffle entries (for entry counts, winner display)
CREATE POLICY "Public can read raffle entries"
  ON raffle_entries FOR SELECT
  USING (true);

-- Authenticated admin full access on raffles
CREATE POLICY "Admin full access on raffles"
  ON raffles FOR ALL
  USING (auth.role() = 'authenticated');

-- Authenticated admin full access on raffle_entries
CREATE POLICY "Admin full access on raffle_entries"
  ON raffle_entries FOR ALL
  USING (auth.role() = 'authenticated');

-- Service role bypass (for API routes using supabaseAdmin)
-- supabaseAdmin uses the service_role key which bypasses RLS
