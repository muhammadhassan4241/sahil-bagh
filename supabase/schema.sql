-- ============================================================
-- Sahil & Bagh  |  Beach Hut & Farmhouse Booking Platform
-- Supabase (Postgres) schema
-- Run this in Supabase SQL editor: Project > SQL Editor > New query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES (extends Supabase auth.users)
-- ------------------------------------------------------------
create type user_role as enum ('customer', 'owner', 'admin');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  whatsapp text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role_val user_role;
begin
  -- Safely determine role, falling back to 'customer'
  begin
    if new.raw_user_meta_data->>'role' in ('customer', 'owner', 'admin') then
      user_role_val := (new.raw_user_meta_data->>'role')::user_role;
    else
      user_role_val := 'customer'::user_role;
    end if;
  exception when others then
    user_role_val := 'customer'::user_role;
  end;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New User'),
    user_role_val
  )
  on conflict (id) do update set
    full_name = coalesce(nullif(trim(excluded.full_name), ''), public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role);

  return new;
exception when others then
  -- CRITICAL: never let a profile-row problem block auth.users signup itself
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2. PROPERTIES (beach huts / farmhouses)
-- ------------------------------------------------------------
create type property_type as enum ('beach_hut', 'farmhouse');

create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  type property_type not null,
  location text not null,               -- e.g. "Hawke's Bay Beach", "French Beach"
  address text,
  description text,
  price_per_night numeric(10,2) not null,
  capacity int not null default 4,
  bedrooms int default 1,
  bathrooms int default 1,
  amenities text[] default '{}',        -- e.g. {"BBQ","Pool","Wifi","Parking"}
  cover_image text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  status text not null default 'active', -- active | inactive | pending_review
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_owner on properties(owner_id);
create index if not exists idx_properties_type on properties(type);
create index if not exists idx_properties_location on properties(location);

-- ------------------------------------------------------------
-- 3. PROPERTY IMAGES (gallery)
-- ------------------------------------------------------------
create table if not exists property_images (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. BOOKINGS
-- ------------------------------------------------------------
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  total_price numeric(10,2) not null,
  commission_amount numeric(10,2) not null default 0,
  status booking_status not null default 'pending',
  customer_notes text,
  created_at timestamptz not null default now(),
  constraint valid_dates check (check_out > check_in)
);

create index if not exists idx_bookings_property on bookings(property_id);
create index if not exists idx_bookings_customer on bookings(customer_id);
create index if not exists idx_bookings_dates on bookings(check_in, check_out);

-- Prevent double booking: no overlapping confirmed/pending bookings for same property
create or replace function check_booking_overlap()
returns trigger as $$
begin
  if exists (
    select 1 from bookings
    where property_id = new.property_id
      and id <> coalesce(new.id, uuid_nil())
      and status in ('pending', 'confirmed')
      and daterange(check_in, check_out) && daterange(new.check_in, new.check_out)
  ) then
    raise exception 'Ye dates already booked hain is property ke liye (double booking not allowed)';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_booking_overlap on bookings;
create trigger trg_check_booking_overlap
  before insert or update on bookings
  for each row execute procedure check_booking_overlap();

-- ------------------------------------------------------------
-- 5. REVIEWS & RATINGS
-- ------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists idx_reviews_property on reviews(property_id);

-- ------------------------------------------------------------
-- 6. FEATURED LISTING PAYMENTS (monetization: Rs 3000-5000/month)
-- ------------------------------------------------------------
create table if not exists featured_listings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  amount numeric(10,2) not null,
  starts_at date not null,
  ends_at date not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table featured_listings enable row level security;

-- Profiles: users can read all profiles (public names), edit only their own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Properties: anyone can view active listings; owners manage their own
create policy "Active properties are public" on properties for select using (status = 'active' or owner_id = auth.uid());
create policy "Owners can insert properties" on properties for insert with check (auth.uid() = owner_id);
create policy "Owners can update own properties" on properties for update using (auth.uid() = owner_id);
create policy "Owners can delete own properties" on properties for delete using (auth.uid() = owner_id);

-- Property images follow the property's visibility
create policy "Images viewable with property" on property_images for select using (true);
create policy "Owners manage own property images" on property_images for insert with check (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Owners delete own property images" on property_images for delete using (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);

-- Bookings: customers see their own bookings, owners see bookings for their properties
create policy "Customers view own bookings" on bookings for select using (
  auth.uid() = customer_id
  or exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Customers create bookings" on bookings for insert with check (auth.uid() = customer_id);
create policy "Owners update booking status" on bookings for update using (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
  or auth.uid() = customer_id
);

-- Reviews: public read, only the customer who booked can write
create policy "Reviews are public" on reviews for select using (true);
create policy "Customers can review own completed bookings" on reviews for insert with check (auth.uid() = customer_id);

-- Featured listings: owners manage their own
create policy "Owners view own featured listings" on featured_listings for select using (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Owners create featured listings" on featured_listings for insert with check (
  exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
);

-- ------------------------------------------------------------
-- STORAGE (run once, or create bucket manually in Supabase Dashboard > Storage)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "Public read property photos" on storage.objects
  for select using (bucket_id = 'property-photos');
create policy "Authenticated upload property photos" on storage.objects
  for insert with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');
