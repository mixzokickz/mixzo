-- Barcode catalog: local cache of scanned products
-- Repeat scans hit this first (instant), then fall back to StockX/GOAT
CREATE TABLE IF NOT EXISTS barcode_catalog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode text UNIQUE NOT NULL,
  barcode_type text DEFAULT 'UPC' CHECK (barcode_type IN ('UPC', 'EAN', 'STYLE_ID', 'CUSTOM')),
  stockx_product_id text,
  stockx_variant_id text,
  product_name text NOT NULL,
  brand text,
  colorway text,
  style_id text,
  size text,
  retail_price numeric,
  image_url text,
  image_urls text[] DEFAULT '{}',
  scan_count integer DEFAULT 1,
  last_scanned_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_barcode_catalog_barcode ON barcode_catalog(barcode);
CREATE INDEX IF NOT EXISTS idx_barcode_catalog_style_id ON barcode_catalog(style_id);
CREATE INDEX IF NOT EXISTS idx_barcode_catalog_product_name ON barcode_catalog USING gin(to_tsvector('english', product_name));
