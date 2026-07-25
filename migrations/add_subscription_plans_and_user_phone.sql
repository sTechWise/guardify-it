-- ==========================================
-- Migration: Add subscription_plans and user_phone columns
-- Date: 2026-07-25
-- ==========================================

-- 1. Add subscription_plans JSONB column to products table
-- Stores array of plan objects: [{duration: "1 Month", price: 250, sale_price: 200}, ...]
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS subscription_plans jsonb DEFAULT '[]'::jsonb;

-- 2. Add user_phone column to orders table
-- Stores the customer's phone number directly (previously embedded in user_email)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_phone text;

-- 3. Add index for faster phone lookups (optional)
CREATE INDEX IF NOT EXISTS idx_orders_user_phone ON public.orders USING btree (user_phone);

COMMENT ON COLUMN public.products.subscription_plans IS 'JSONB array of subscription plan options. Each element: {duration: string, price: number, sale_price?: number}. When present, customers choose a plan on the product page.';
COMMENT ON COLUMN public.orders.user_phone IS 'Customer phone/WhatsApp number for order communication.';
