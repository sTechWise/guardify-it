-- Create tables
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
    user_id uuid references auth.users(id)
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
-- Enable RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table payment_proofs enable row level security;
-- Products Policies
drop policy if exists "Public read products" on products;
create policy "Public read products" on products for
select using (true);
drop policy if exists "Admins manage products" on products;
create policy "Admins manage products" on products for all using (
    exists (
        select 1
        from user_roles
        where user_id = auth.uid()
            and role = 'admin'
    )
);
-- Orders Policies
drop policy if exists "Users view own orders" on orders;
create policy "Users view own orders" on orders for
select using (auth.email() = user_email);
drop policy if exists "Users create orders" on orders;
create policy "Users create orders" on orders for
insert with check (auth.email() = user_email);
drop policy if exists "Admins view all orders" on orders;
create policy "Admins view all orders" on orders for
select using (
        exists (
            select 1
            from user_roles
            where user_id = auth.uid()
                and role = 'admin'
        )
    );
drop policy if exists "Admins update orders" on orders;
create policy "Admins update orders" on orders for
update using (
        exists (
            select 1
            from user_roles
            where user_id = auth.uid()
                and role = 'admin'
        )
    );
-- Payment Proofs Policies
drop policy if exists "Users view own proofs" on payment_proofs;
create policy "Users view own proofs" on payment_proofs for
select using (
        exists (
            select 1
            from orders
            where orders.id = payment_proofs.order_id
                and orders.user_email = auth.email()
        )
    );
drop policy if exists "Users upload proofs" on payment_proofs;
create policy "Users upload proofs" on payment_proofs for
insert with check (
        exists (
            select 1
            from orders
            where orders.id = payment_proofs.order_id
                and orders.user_email = auth.email()
        )
    );
drop policy if exists "Admins manage proofs" on payment_proofs;
create policy "Admins manage proofs" on payment_proofs for all using (
    exists (
        select 1
        from user_roles
        where user_id = auth.uid()
            and role = 'admin'
    )
);
-- RPC Functions
-- Get Order Summary
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
-- Submit Payment Proof
create or replace function submit_payment_proof(
        p_order_id uuid,
        p_user_email text,
        p_transaction_id text,
        p_screenshot_url text
    ) returns json language plpgsql security definer as $$
declare v_order_exists boolean;
begin -- Check if order exists and email matches
select exists(
        select 1
        from orders
        where id = p_order_id
            and user_email = p_user_email
    ) into v_order_exists;
if not v_order_exists then return json_build_object(
    'success',
    false,
    'error',
    'Order not found or email mismatch'
);
end if;
-- Insert proof
insert into payment_proofs (
        order_id,
        user_email,
        transaction_id,
        screenshot_url
    )
values (
        p_order_id,
        p_user_email,
        p_transaction_id,
        p_screenshot_url
    );
-- Update order status
update orders
set status = 'verifying_payment'
where id = p_order_id;
return json_build_object('success', true);
exception
when others then return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
-- Storage Setup (Execute this if your bucket doesn't exist)
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true) on conflict (id) do nothing;
-- Storage Policies
-- CAUTION: For production, you might want stricter policies.
-- Allowing public upload for guest checkout support.
drop policy if exists "Public Upload" on storage.objects;
create policy "Public Upload" on storage.objects for
insert with check (bucket_id = 'payment-proofs');
drop policy if exists "Public Read" on storage.objects;
create policy "Public Read" on storage.objects for
select using (bucket_id = 'payment-proofs');