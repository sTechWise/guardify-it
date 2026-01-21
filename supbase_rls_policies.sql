-- Enable RLS on all tables
alter table products enable row level security;
alter table orders enable row level security;
alter table payment_proofs enable row level security;

-- Products Policies
drop policy if exists "Public read products" on products;
create policy "Public read products"
on products for select
using (true);

drop policy if exists "Admins manage products" on products;
create policy "Admins manage products"
on products
for all
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Orders Policies
drop policy if exists "Users view own orders" on orders;
create policy "Users view own orders"
on orders for select
using (auth.email() = user_email);

drop policy if exists "Users create orders" on orders;
create policy "Users create orders"
on orders for insert
with check (
  -- Allow anyone to insert, but server action handles logic. 
  -- Ideally, restrict to auth.email() matching, but guest checkout makes this tricky.
  -- For now, allow insert if user_email matches auth, OR if it's a server-side role (service_role checks bypass RLS anyway).
  -- Since we use Server Action with Service Role (likely) or user context?
  -- Wait, createOrder uses createClient() which uses cookies -> user context.
  auth.email() = user_email
);

drop policy if exists "Admins view all orders" on orders;
create policy "Admins view all orders"
on orders for select
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "Admins update orders" on orders;
create policy "Admins update orders"
on orders for update
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

-- Payment Proofs Policies
drop policy if exists "Users view own proofs" on payment_proofs;
create policy "Users view own proofs"
on payment_proofs for select
using (
  exists (
    select 1 from orders
    where orders.id = payment_proofs.order_id
    and orders.user_email = auth.email()
  )
);

drop policy if exists "Users upload proofs" on payment_proofs;
create policy "Users upload proofs"
on payment_proofs for insert
with check (
   exists (
    select 1 from orders
    where orders.id = payment_proofs.order_id
    and orders.user_email = auth.email()
  )
);

drop policy if exists "Admins manage proofs" on payment_proofs;
create policy "Admins manage proofs"
on payment_proofs for all
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);
