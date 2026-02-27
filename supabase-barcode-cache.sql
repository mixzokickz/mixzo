-- Barcode Cache: Self-learning barcode→product mapping
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS barcode_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode text UNIQUE NOT NULL,
  product_name text NOT NULL,
  brand text,
  colorway text,
  style_id text,
  size text,
  retail_price numeric,
  image_url text,
  image_urls jsonb DEFAULT '[]'::jsonb,
  stockx_product_id text,
  goat_product_id text,
  scan_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_barcode_cache_barcode ON barcode_cache(barcode);
CREATE INDEX IF NOT EXISTS idx_barcode_cache_style_id ON barcode_cache(style_id);

-- Allow authenticated users to read/write
ALTER TABLE barcode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read barcode cache"
  ON barcode_cache FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert barcode cache"
  ON barcode_cache FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update barcode cache"
  ON barcode_cache FOR UPDATE TO authenticated USING (true);

-- Also allow service role (API routes)
CREATE POLICY "Service role full access"
  ON barcode_cache FOR ALL TO service_role USING (true);
