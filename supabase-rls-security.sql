-- ============================================
-- MixzoKickz RLS Security Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Drop all existing policies first (clean slate)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockx_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper: Check if user is admin/manager
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('owner', 'manager', 'admin')
  );
END;
$$;

-- ============================================
-- PRODUCTS: Public read, admin write
-- ============================================
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- ORDERS: Users see own, admin sees all
-- ============================================
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (
    user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "orders_admin_delete" ON orders
  FOR DELETE USING (is_admin());

-- ============================================
-- ORDER_ITEMS: Same as orders
-- ============================================
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "order_items_admin_manage" ON order_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- PROFILES: Users see own, admin sees all
-- ============================================
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- SETTINGS: Admin only
-- ============================================
CREATE POLICY "settings_admin_only" ON settings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- STOCKX_TOKENS: Service role only (NO anon/auth access)
-- ============================================
-- No policies = no access for anon or authenticated users
-- Only service_role key can access (used by API routes)

-- ============================================
-- BARCODE_CACHE: Admin only
-- ============================================
CREATE POLICY "barcode_cache_admin_only" ON barcode_cache
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- WISHLISTS: Users see own
-- ============================================
CREATE POLICY "wishlists_own" ON wishlists
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================
-- REVIEWS: Public read, own write
-- ============================================
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_own_write" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_own_update" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- GIFT_CARDS: Admin manage, public validate
-- ============================================
CREATE POLICY "gift_cards_admin_all" ON gift_cards
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "gift_cards_public_read" ON gift_cards
  FOR SELECT USING (true);

-- ============================================
-- NOTIFICATIONS: Users see own, admin all
-- ============================================
CREATE POLICY "notifications_own_read" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- DAILY_DEALS: Public read, admin write
-- ============================================
CREATE POLICY "daily_deals_public_read" ON daily_deals
  FOR SELECT USING (true);

CREATE POLICY "daily_deals_admin_all" ON daily_deals
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- PAYMENT_LINKS: Admin only
-- ============================================
CREATE POLICY "payment_links_admin_only" ON payment_links
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- RAFFLES: Public read active, admin all
-- ============================================
CREATE POLICY "raffles_public_read" ON raffles
  FOR SELECT USING (true);

CREATE POLICY "raffles_admin_all" ON raffles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- RAFFLE_ENTRIES: Own entries, admin all
-- ============================================
CREATE POLICY "raffle_entries_own_read" ON raffle_entries
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "raffle_entries_own_insert" ON raffle_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "raffle_entries_admin_all" ON raffle_entries
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
