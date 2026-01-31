-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Medicines Table
create table if not exists medicines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  price numeric not null,
  stock_quantity int not null default 0,
  manufacturer text,
  dosage text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Carts Table
create table if not exists carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Cart Items Table
create table if not exists cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade not null,
  medicine_id uuid references medicines(id) on delete cascade not null,
  quantity int not null default 1,
  created_at timestamp with time zone default now(),
  unique(cart_id, medicine_id)
);

-- Orders Table
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  status text not null check (status in ('pending', 'paid', 'cancelled')),
  total_amount numeric not null,
  shipping_address jsonb,
  created_at timestamp with time zone default now()
);

-- Order Items Table
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  medicine_id uuid references medicines(id) on delete set null,
  quantity int not null,
  price_at_purchase numeric not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists medicines_name_idx on medicines(name);
create index if not exists medicines_category_idx on medicines(category);

-- RLS Policies
alter table medicines enable row level security;
create policy "Public medicines are viewable by everyone" on medicines for select using (true);

alter table carts enable row level security;
create policy "Users can view their own cart" on carts for select using (auth.uid() = user_id);
create policy "Users can insert their own cart" on carts for insert with check (auth.uid() = user_id);
create policy "Users can update their own cart" on carts for update using (auth.uid() = user_id);

alter table cart_items enable row level security;
create policy "Users can view their own cart items" on cart_items for select using (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
create policy "Users can insert their own cart items" on cart_items for insert with check (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
create policy "Users can update their own cart items" on cart_items for update using (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);
create policy "Users can delete their own cart items" on cart_items for delete using (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);

alter table orders enable row level security;
create policy "Users can view their own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert their own orders" on orders for insert with check (auth.uid() = user_id);

alter table order_items enable row level security;
create policy "Users can view their own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Seed Data (Optional)
insert into medicines (name, description, category, price, stock_quantity, manufacturer, dosage, image_url) values
('Paracetamol', 'Pain reliever and fever reducer.', 'Pain Relief', 5.00, 100, 'HealthCorp', '500mg', 'https://placehold.co/400x400?text=Paracetamol'),
('Amoxicillin', 'Antibiotic used to treat bacterial infections.', 'Antibiotics', 12.50, 50, 'PharmaInc', '250mg', 'https://placehold.co/400x400?text=Amoxicillin'),
('Ibuprofen', 'Nonsteroidal anti-inflammatory drug.', 'Pain Relief', 8.75, 75, 'WellnessLtd', '200mg', 'https://placehold.co/400x400?text=Ibuprofen'),
('Cetirizine', 'Antihistamine used to treat allergies.', 'Allergy', 6.00, 120, 'AllergyCare', '10mg', 'https://placehold.co/400x400?text=Cetirizine'),
('Vitamin C', 'Dietary supplement.', 'Vitamins', 15.00, 200, 'NutriLife', '1000mg', 'https://placehold.co/400x400?text=Vitamin+C')
on conflict do nothing;
