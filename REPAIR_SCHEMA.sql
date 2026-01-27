-- ==========================================
-- RECOVERY SCRIPT (V2): EXECUTE IN SUPABASE SQL EDITOR
-- ==========================================
-- 0. PRE-FLIGHT CLEANUP: Drop conflicting function to fix "Return Type Mismatch" error
drop function if exists get_order_summary(uuid);
-- 1. CORE TABLES (Safe to run even if they exist)
create table if not exists products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price numeric not null,
    image_url text,
    category text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table if not exists orders (
    id uuid default gen_random_uuid() primary key,
    user_email text not null,
    total_amount numeric not null,
    status text default 'pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id),
    items jsonb -- Ensure items column exists
);
create table if not exists payment_proofs (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references orders(id) not null,
    user_email text not null,
    transaction_id text not null,
    screenshot_url text,
    status text default 'pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 2. FIX ADMIN LOCKOUT: Ensure user_roles exists and is readable
create table if not exists user_roles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    role text not null check (role in ('admin', 'moderator', 'user')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, role)
);
alter table user_roles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table payment_proofs enable row level security;
-- Allow users to read their OWN role (Crucial for Middleware check)
drop policy if exists "Users can read own role" on user_roles;
create policy "Users can read own role" on user_roles for
select using (user_id = auth.uid());
-- Allow Admins to read all roles
drop policy if exists "Admins can read all roles" on user_roles;
create policy "Admins can read all roles" on user_roles for
select using (
        exists (
            select 1
            from user_roles ur
            where ur.user_id = auth.uid()
                and ur.role = 'admin'
        )
    );
-- 3. FIX GUEST ORDER LINKING: Add Missing RPC
create or replace function link_orders_to_user() returns void language plpgsql security definer as $$ begin -- Update all orders that match the user's email but have no user_id
update orders
set user_id = auth.uid()
where user_email = auth.email()
    and user_id is null;
end;
$$;
-- 4. SECURITY FIX: Harden get_order_summary (Recreated after drop)
create or replace function get_order_summary(p_order_id uuid) returns table (
        user_email text,
        total_amount numeric,
        status text
    ) language plpgsql security definer as $$ begin return query
select o.user_email,
    o.total_amount,
    o.status
from orders o
where o.id = p_order_id;
end;
$$;