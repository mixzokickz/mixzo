-- Support Tickets System
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'staff')),
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access tickets" ON support_tickets FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access messages" ON ticket_messages FOR ALL TO service_role USING (true);
CREATE POLICY "Auth read tickets" ON support_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read messages" ON ticket_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert messages" ON ticket_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update tickets" ON support_tickets FOR UPDATE TO authenticated USING (true);
