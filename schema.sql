-- ==========================================
-- GUARDIFY IT — Authoritative Database Schema
-- Generated from live Supabase DB: 2026-07-18
-- Project: ctroflmruwjxjrjopogj
-- ==========================================

-- ==========================================
-- 0. UTILITY FUNCTIONS
-- ==========================================

-- Helper: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Auto-enable RLS on new public tables
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL
        AND cmd.schema_name IN ('public')
        AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
        AND cmd.schema_name NOT LIKE 'pg_toast%'
        AND cmd.schema_name NOT LIKE 'pg_temp%'
     THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     END IF;
  END LOOP;
END;
$$;


-- ==========================================
-- 1. TABLES
-- ==========================================

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    slug        text NOT NULL UNIQUE,
    description text,
    name_bengali text,
    icon        text,
    product_count integer DEFAULT 0,
    created_at  timestamp without time zone DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title               text NOT NULL,
    title_bengali       text,
    description         text,
    description_bengali text,
    price               numeric NOT NULL,
    sale_price          numeric,
    currency            text DEFAULT 'BDT',
    subscription_type   text,
    duration            text,
    image_url           text,
    status              text DEFAULT 'active',
    stock_status        text DEFAULT 'in_stock',
    badge               text,
    rating              numeric DEFAULT 5.0,
    review_count        integer DEFAULT 0,
    is_featured         boolean DEFAULT false,
    is_new              boolean DEFAULT false,
    delivery_method     text DEFAULT 'email_whatsapp',
    delivery_time       text DEFAULT '5-30 minutes',
    warranty_period     text DEFAULT '30 days',
    support_available   boolean DEFAULT true,
    category_id         uuid REFERENCES public.categories(id),
    created_at          timestamp without time zone DEFAULT now(),
    updated_at          timestamp with time zone DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email      text NOT NULL,
    total_amount    numeric NOT NULL,
    status          text DEFAULT 'pending_payment',
    items           jsonb DEFAULT '[]'::jsonb,
    user_id         uuid REFERENCES auth.users(id),
    created_at      timestamp without time zone DEFAULT now()
);

-- Payment Proofs
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id        uuid REFERENCES public.orders(id) UNIQUE,
    user_email      text,
    payment_method  text,
    transaction_id  text UNIQUE,
    screenshot_url  text,
    status          text DEFAULT 'submitted',
    submitted_at    timestamp without time zone DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id     uuid REFERENCES auth.users(id) PRIMARY KEY,
    role        text NOT NULL CHECK (role IN ('admin', 'moderator', 'user'))
);

-- Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES auth.users(id),
    product_id  uuid NOT NULL REFERENCES public.products(id),
    created_at  timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id)
);


-- ==========================================
-- 2. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_order_id ON public.payment_proofs USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists USING btree (product_id);


-- ==========================================
-- 3. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins insert categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins update categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (is_admin());

CREATE POLICY "Admins delete categories" ON public.categories
    FOR DELETE TO authenticated
    USING (is_admin());

-- Products Policies
CREATE POLICY "Public read active products" ON public.products
    FOR SELECT TO public
    USING (status = 'active');

CREATE POLICY "Admins insert products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins update products" ON public.products
    FOR UPDATE TO authenticated
    USING (is_admin());

CREATE POLICY "Admins delete products" ON public.products
    FOR DELETE TO authenticated
    USING (is_admin());

-- Orders Policies
CREATE POLICY "Users view own orders_v2" ON public.orders
    FOR SELECT TO public
    USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') = user_email);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.email() = user_email);

CREATE POLICY "Admins view all orders" ON public.orders
    FOR SELECT TO public
    USING (is_admin());

CREATE POLICY "Admins update orders" ON public.orders
    FOR UPDATE TO public
    USING (is_admin());

-- Payment Proofs Policies
CREATE POLICY "Read payment proofs" ON public.payment_proofs
    FOR SELECT TO public
    USING (
        is_admin()
        OR order_id IN (
            SELECT orders.id FROM orders
            WHERE orders.user_email = auth.email()
            OR orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins full access proofs" ON public.payment_proofs
    FOR ALL TO public
    USING (is_admin());

-- User Roles Policies
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT TO public
    USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles" ON public.user_roles
    FOR SELECT TO public
    USING (is_admin());

-- Wishlists Policies
CREATE POLICY "Users manage wishlist" ON public.wishlists
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 4. RPC FUNCTIONS
-- ==========================================

-- Get Order Summary (used by payment proof upload page)
CREATE OR REPLACE FUNCTION public.get_order_summary(p_order_id uuid)
RETURNS TABLE (
    id uuid,
    created_at timestamp without time zone,
    user_email text,
    total_amount numeric,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.created_at, o.user_email, o.total_amount, o.status
    FROM orders o
    WHERE o.id = p_order_id;
END;
$$;

-- Submit Payment Proof (upserts proof, updates order status)
CREATE OR REPLACE FUNCTION public.submit_payment_proof(
    p_order_id uuid,
    p_user_email text,
    p_transaction_id text,
    p_screenshot_url text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result json;
BEGIN
    -- Verify order exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM orders
        WHERE id = p_order_id
        AND (user_email = p_user_email OR user_email = auth.email())
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Order not found or access denied');
    END IF;

    -- Upsert proof (insert or update if exists)
    INSERT INTO payment_proofs (order_id, user_email, transaction_id, screenshot_url, status)
    VALUES (p_order_id, p_user_email, p_transaction_id, p_screenshot_url, 'submitted')
    ON CONFLICT (order_id)
    DO UPDATE SET
        transaction_id = EXCLUDED.transaction_id,
        screenshot_url = EXCLUDED.screenshot_url,
        submitted_at = now(),
        status = 'submitted';

    -- Update order status
    UPDATE orders SET status = 'payment_submitted' WHERE id = p_order_id;

    RETURN json_build_object('success', true);
END;
$$;

-- Approve/Reject Payment Proof (admin only)
CREATE OR REPLACE FUNCTION public.approve_payment_proof(
    p_proof_id uuid,
    p_new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_order_id uuid;
    v_is_admin boolean;
    v_new_order_status text;
BEGIN
    -- 1. Verify caller is admin
    SELECT is_admin() INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN json_build_object('success', false, 'error', 'Access denied. Admin role required.');
    END IF;

    -- 2. Validate status
    IF p_new_status NOT IN ('approved', 'rejected') THEN
        RETURN json_build_object('success', false, 'error', 'Invalid status. Must be approved or rejected.');
    END IF;

    -- 3. Get order_id from proof
    SELECT order_id INTO v_order_id FROM payment_proofs WHERE id = p_proof_id;
    IF v_order_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Payment proof not found.');
    END IF;

    -- 4. Determine new order status
    IF p_new_status = 'approved' THEN
        v_new_order_status := 'paid';
    ELSE
        v_new_order_status := 'payment_failed';
    END IF;

    -- 5. Update payment proof status
    UPDATE payment_proofs SET status = p_new_status WHERE id = p_proof_id;

    -- 6. Update order status
    UPDATE orders SET status = v_new_order_status WHERE id = v_order_id;

    RETURN json_build_object(
        'success', true,
        'proof_status', p_new_status,
        'order_status', v_new_order_status
    );
END;
$$;

-- Link guest orders to newly registered user (called via RPC)
CREATE OR REPLACE FUNCTION public.link_orders_to_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE orders
    SET user_id = auth.uid()
    WHERE user_email = auth.email()
      AND user_id IS NULL;
END;
$$;

-- Link guest orders (called by trigger on auth.users insert)
CREATE OR REPLACE FUNCTION public.link_guest_orders_to_user(
    p_user_id uuid,
    p_user_email text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    affected_rows integer;
BEGIN
    IF p_user_id IS NULL OR p_user_email IS NULL THEN
        RETURN 0;
    END IF;

    UPDATE orders
    SET user_id = p_user_id
    WHERE user_email = p_user_email
      AND user_id IS NULL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

-- Trigger: Auto-link guest orders on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    PERFORM link_guest_orders_to_user(NEW.id, NEW.email);
    RETURN NEW;
END;
$$;


-- ==========================================
-- 5. STORAGE
-- ==========================================

-- Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Product Images
CREATE POLICY "Public read product images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images" ON storage.objects
    FOR INSERT TO public
    WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins update product images" ON storage.objects
    FOR UPDATE TO public
    USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins delete product images" ON storage.objects
    FOR DELETE TO public
    USING (bucket_id = 'product-images' AND is_admin());

-- Storage Policies: Payment Proofs
CREATE POLICY "Public upload proofs" ON storage.objects
    FOR INSERT TO public
    WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Admins view proofs" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'payment-proofs' AND is_admin());


-- ==========================================
-- 6. CONTACT MESSAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Only admins can read contact messages
CREATE POLICY "Admins can read contact messages"
    ON public.contact_messages
    FOR SELECT TO authenticated
    USING (is_admin());

-- Anyone can insert (service role bypasses RLS for API route)
-- No public insert policy needed since we use service role key


-- ==========================================
-- 7. ORDER STATUS REFERENCE
-- ==========================================
-- Order statuses (lifecycle):
--   pending_payment    → Order created, awaiting payment
--   payment_submitted  → Payment proof uploaded by customer
--   paid               → Payment verified/approved by admin
--   payment_failed     → Payment rejected by admin
--   completed          → Order fulfilled, subscription delivered
--   cancelled          → Order cancelled
--
-- Payment proof statuses:
--   submitted → approved | rejected

