-- Add stripe_session_id column to orders table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Create index for fast lookup by session ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Create index for fast lookup by order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
