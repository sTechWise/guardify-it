-- ==========================================
-- FINAL PRODUCTION CLEANUP SCRIPT
-- ==========================================
-- 1. SECURITY FIX: Products Visibility
-- Issue: "Public read products" (True) overrides "Public read active products".
-- Fix: Drop the permissive policy so only active products are seen by public.
-- Admins can still see all due to "Admins manage products".
drop policy if exists "Public read products" on products;
-- Ensure "Public read active products" exists (if not, recreate it)
drop policy if exists "Public read active products" on products;
create policy "Public read active products" on products for
select to public using (status = 'active');
-- 2. CLEANUP: Duplicate User Role Policies
-- Issue: "Users can read own role" and "Users read own role" are identical.
-- Fix: Keep one standardized naming.
drop policy if exists "Users read own role" on user_roles;
-- We keep "Users can read own role" as it was in our Recovery script.
-- 3. VERIFY: Order Linking
-- We rely on the "link_orders_to_user" RPC for the frontend manual check.
-- If there is a trigger, it's a bonus, but we won't break the RPC.
-- No action needed here, just cleanliness.
-- 4. HARDENING: Orders
-- Ensure "Users create orders" matches "Authenticated insert orders" or consolidate.
-- "Authenticated insert orders" checks auth.uid IS NOT NULL.
-- "Users create orders" checks auth.email = user_email.
-- We will consolidate to a single clear policy for inserts.
drop policy if exists "Users create orders" on orders;
drop policy if exists "Authenticated insert orders" on orders;
create policy "Users can create own orders" on orders for
insert to authenticated with check (auth.email() = user_email);
-- Note: Guest checkout uses Service Role, which bypasses RLS, so we don't need a public insert policy strictly,
-- UNLESS the guest checkout flow inserts directly from client (which we moved to Server Action).
-- If createOrder action is used, it uses Service Role -> Bypass RLS.
-- So we can strictly limit INSERT to authenticated users for extra security.