-- Glowcrown: run once in a new Supabase project's SQL editor.
create extension if not exists pgcrypto;
create table public.admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,name text not null default '',email text not null,phone text default '',notes text default '',created_at timestamptz not null default now());
create table public.products(id uuid primary key default gen_random_uuid(),name text not null check(length(name)>0),category text not null,price numeric(12,2) not null check(price>0),compare_price numeric(12,2) not null default 0 check(compare_price>=0),image text not null check(image ~ '^https://'),description text not null default '',stock integer not null default 0 check(stock>=0),sizes text[] not null default array['S','M','L','XL'] check(cardinality(sizes)>0),active boolean not null default true,featured boolean not null default false,created_at timestamptz not null default now());
create table public.coupons(id uuid primary key default gen_random_uuid(),code text unique not null check(code=upper(code) and length(code)>0),percent integer not null check(percent between 1 and 100),min_order numeric(12,2) not null default 0 check(min_order>=0),max_uses integer not null default 100 check(max_uses>0),uses integer not null default 0 check(uses>=0),expires_at timestamptz,active boolean not null default true,created_at timestamptz not null default now());
create table public.orders(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),request_key uuid not null,items jsonb not null,shipping jsonb not null,subtotal numeric(12,2) not null,discount numeric(12,2) not null default 0,shipping_fee numeric(12,2) not null,total numeric(12,2) not null,coupon_id uuid references public.coupons(id) on delete set null,status text not null default 'Placed' check(status in ('Placed','Processing','Shipped','Delivered','Cancelled')),tracking text default '',payment_method text not null default 'COD',created_at timestamptz not null default now(),unique(user_id,request_key));
create index orders_user_idx on public.orders(user_id);
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
create policy admins_self on public.admins for select to authenticated using(user_id=auth.uid());
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profiles_admin_update on public.profiles for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy products_read on public.products for select to anon,authenticated using(active or public.is_admin());
create policy products_admin on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy coupons_admin on public.coupons for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy orders_read on public.orders for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated using(public.is_admin()) with check(public.is_admin());
-- Explicit column privileges prevent bypassing totals and stock through the REST API.
revoke all on public.admins,public.profiles,public.products,public.coupons,public.orders from anon,authenticated;
grant select on public.products to anon,authenticated;
grant select on public.admins,public.profiles,public.coupons,public.orders to authenticated;
grant insert,update,delete on public.products to authenticated;
grant insert(code,percent,min_order,max_uses,expires_at,active),update(code,percent,min_order,max_uses,expires_at,active),delete on public.coupons to authenticated;
grant update(name,phone,notes) on public.profiles to authenticated;
grant update(status,tracking) on public.orders to authenticated;
create function public.new_customer() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,name,email) values(new.id,coalesce(new.raw_user_meta_data->>'name',''),new.email);return new;end; $$;
create trigger auth_customer after insert on auth.users for each row execute function public.new_customer();
-- One transaction: authoritative prices, coupon validation, stock reservation and idempotency.
create function public.place_order(items jsonb,shipping jsonb,coupon_code text,request_key uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); item jsonb; p public.products%rowtype; c public.coupons%rowtype; result public.orders%rowtype; subtotal numeric:=0; discount numeric:=0; fee numeric:=0; qty integer; lines jsonb:='[]'::jsonb;
begin
 if uid is null then raise exception 'Sign in to place an order';end if;
 if request_key is null then raise exception 'Missing checkout reference';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into result from public.orders o where o.user_id=uid and o.request_key=place_order.request_key;
 if found then return to_jsonb(result);end if;
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 100 then raise exception 'Your bag must contain 1 to 100 items';end if;
 if coalesce(length(trim(shipping->>'name')),0)<2 or coalesce(length(trim(shipping->>'address')),0)<5 or coalesce(length(trim(shipping->>'city')),0)<2 or coalesce(length(trim(shipping->>'state')),0)<2 or coalesce(shipping->>'pincode','') !~ '^[1-9][0-9]{5}$' or coalesce(shipping->>'phone','') !~ '^\+?[0-9 ()-]{10,16}$' then raise exception 'Enter a valid name, address, city, state, phone and six-digit PIN code';end if;
 -- Stable product lock order avoids cross-cart deadlocks. Duplicate lines consume stock cumulatively.
 for item in select value from jsonb_array_elements(items) order by value->>'id' loop
  if coalesce(item->>'qty','') !~ '^[0-9]+$' then raise exception 'Invalid quantity';end if;
  qty:=(item->>'qty')::integer;
  if qty not between 1 and 100 then raise exception 'Quantity must be between 1 and 100';end if;
  select * into p from public.products where id=(item->>'id')::uuid for update;
  if not found or not p.active then raise exception 'A product is no longer available';end if;
  if not coalesce((item->>'size')=any(p.sizes),false) then raise exception 'Choose an available size for %',p.name;end if;
  if p.stock<qty then raise exception 'Insufficient stock for %',p.name;end if;
  subtotal:=subtotal+p.price*qty;
  lines:=lines||jsonb_build_array(jsonb_build_object('id',p.id,'name',p.name,'size',item->>'size','qty',qty,'price',p.price,'image',p.image));
  update public.products set stock=stock-qty where id=p.id;
 end loop;
 if length(trim(coalesce(coupon_code,'')))>0 then
  select * into c from public.coupons where code=upper(trim(coupon_code)) for update;
  if not found or not c.active or c.uses>=c.max_uses or (c.expires_at is not null and c.expires_at<=now()) or subtotal<c.min_order then raise exception 'Coupon is invalid, expired or its minimum order has not been met';end if;
  discount:=round(subtotal*c.percent/100,2);
  update public.coupons set uses=uses+1 where id=c.id;
 end if;
 fee:=case when subtotal>=1999 then 0 else 99 end;
 insert into public.orders(user_id,request_key,items,shipping,subtotal,discount,shipping_fee,total,coupon_id) values(uid,request_key,lines,shipping,subtotal,discount,fee,subtotal-discount+fee,c.id) returning * into result;
 update public.profiles set name=shipping->>'name',phone=shipping->>'phone' where id=uid;
 return to_jsonb(result);
end; $$;
revoke all on function public.place_order(jsonb,jsonb,text,uuid) from public,anon;
grant execute on function public.place_order(jsonb,jsonb,text,uuid) to authenticated;
create function public.order_status_guard() returns trigger language plpgsql security definer set search_path=public as $$
declare line jsonb;
begin
 if old.status='Cancelled' and new.status<>'Cancelled' then raise exception 'Cancelled orders cannot be reopened';end if;
 if old.status='Delivered' and new.status<>'Delivered' then raise exception 'Delivered orders cannot change status';end if;
 if old.status='Shipped' and new.status not in ('Shipped','Delivered') then raise exception 'Shipped orders may only be marked delivered';end if;
 if new.status='Cancelled' and old.status<>'Cancelled' then
  for line in select value from jsonb_array_elements(old.items) order by value->>'id' loop
   update public.products set stock=stock+(line->>'qty')::integer where id=(line->>'id')::uuid;
  end loop;
  if old.coupon_id is not null then update public.coupons set uses=greatest(0,uses-1) where id=old.coupon_id;end if;
 end if;
 return new;
end; $$;
create trigger order_status_guard before update on public.orders for each row execute function public.order_status_guard();
-- Trigger functions aren't callable by clients.
revoke all on function public.new_customer(),public.order_status_guard() from public,anon,authenticated;
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
