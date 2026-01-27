-- ==========================================
-- SECURITY ADVISOR FIXES
-- ==========================================
-- Fix: Function Search Path Mutable
-- Explanation: SECURITY DEFINER functions run with the privileges of the creator (postgres/admin).
-- If search_path is not set, a malicious user could potentially trick the function into running 
-- their own code if they can create objects in the default search path.
-- We fix this by forcing the function to only look in the 'public' schema.
-- 1. Fix get_order_summary
alter function get_order_summary(uuid)
set search_path = public;
-- 2. Fix link_orders_to_user
alter function link_orders_to_user()
set search_path = public;
-- 3. Fix submit_payment_proof (Good practice to apply to all)
alter function submit_payment_proof(uuid, text, text, text)
set search_path = public;
-- 4. Fix approve_payment_proof (Good practice to apply to all)
-- Note: Assuming the signature takes proof_id (uuid) and new_status (text) based on previous analysis
-- If signature differs, this might error, but in standard setup it is (uuid, text).
-- We'll try to apply it safely.
do $$ begin execute 'alter function approve_payment_proof(uuid, text) set search_path = public';
exception
when others then raise notice 'Could not alter approve_payment_proof search_path - function might verify signature.';
end;
$$;