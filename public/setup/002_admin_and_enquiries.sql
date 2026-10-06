-- Run this once on an existing Glowcrown database; already included in schema.sql for new installs.
begin;
create table if not exists public.enquiries(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 100),
 email text not null check(length(email)<=254),
 phone text not null default '' check(length(phone)<=30),
 subject text not null check(length(subject) between 2 and 150),
 message text not null check(length(message) between 10 and 3000),
 status text not null default 'New' check(status in ('New','Resolved')),
 created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon,authenticated;
grant all on public.enquiries to service_role;
-- Admin access now comes exclusively through verified environment-credential sessions.
drop policy if exists products_admin on public.products;
drop policy if exists coupons_admin on public.coupons;
drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists products_read on public.products;
create policy products_read on public.products for select to anon,authenticated using(active);
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated using(user_id=auth.uid());
revoke insert,update,delete on public.products,public.coupons,public.profiles,public.orders from authenticated;
-- Revoke the old explicit column privileges as well.
revoke insert(code,percent,min_order,max_uses,expires_at,active),update(code,percent,min_order,max_uses,expires_at,active) on public.coupons from authenticated;
revoke update(name,phone,notes) on public.profiles from authenticated;
revoke update(status,tracking) on public.orders from authenticated;
grant all on public.products,public.orders,public.coupons,public.profiles to service_role;
commit;
