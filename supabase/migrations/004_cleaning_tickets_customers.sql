-- Cleaning Requests
CREATE TABLE IF NOT EXISTS cleaning_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  shoe_brand TEXT,
  shoe_model TEXT,
  service_tier TEXT DEFAULT 'basic' CHECK (service_tier IN ('basic', 'deep', 'premium', 'restoration', 'cleaning', 'cleaning_icing')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'approved', 'in_progress', 'completed', 'shipped_back')),
  condition TEXT,
  price NUMERIC(10,2),
  notes TEXT,
  before_photos TEXT[] DEFAULT '{}',
  after_photos TEXT[] DEFAULT '{}',
  tracking_number TEXT,
  tier_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  sender_type TEXT DEFAULT 'customer' CHECK (sender_type IN ('customer', 'staff')),
  sender_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (for admin customer management)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barcode cache (if not exists from migration 003)
CREATE TABLE IF NOT EXISTS barcode_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE NOT NULL,
  product_name TEXT,
  brand TEXT,
  colorway TEXT,
  style_id TEXT,
  size TEXT,
  retail_price NUMERIC(10,2),
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  stockx_product_id TEXT,
  goat_product_id TEXT,
  scan_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- StockX tokens
CREATE TABLE IF NOT EXISTS stockx_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token TEXT NOT NULL,
  refresh_token TEXT DEFAULT '',
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_status ON cleaning_requests(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_user ON cleaning_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_barcode_cache_barcode ON barcode_cache(barcode);

-- RLS
ALTER TABLE cleaning_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockx_tokens ENABLE ROW LEVEL SECURITY;

-- Permissive policies (tighten later)
CREATE POLICY "Allow all authenticated" ON cleaning_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated" ON ticket_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated" ON barcode_cache FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all authenticated" ON stockx_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role full access (for API routes)
CREATE POLICY "Service role full access" ON cleaning_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tickets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ticket_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON barcode_cache FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON stockx_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public can submit cleaning requests and tickets
CREATE POLICY "Public insert cleaning" ON cleaning_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public insert tickets" ON tickets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public insert messages" ON ticket_messages FOR INSERT TO anon WITH CHECK (true);
