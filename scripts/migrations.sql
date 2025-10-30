-- SQL migrations skeleton for Vestti Marketplace (Phase 1)
-- Run these statements against your Supabase Postgres instance.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  store_name text,
  slug text,
  bio text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text,
  parent_id uuid NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid REFERENCES vendors(id),
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  slug text,
  description text,
  price_cents integer NOT NULL,
  stock integer DEFAULT 0,
  images jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  total_cents integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  qty integer,
  price_cents integer
);

CREATE TABLE commissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  percentage_decimal numeric,
  effective_from timestamptz,
  created_by_admin_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  user_id uuid REFERENCES users(id),
  rating integer,
  text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE coupons (
  code text PRIMARY KEY,
  discount_percent integer,
  valid_from timestamptz,
  valid_to timestamptz,
  usage_limit integer,
  used_count integer DEFAULT 0
);

CREATE TABLE admin_audit (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES users(id),
  action text,
  target_table text,
  target_id uuid,
  timestamp timestamptz DEFAULT now()
);
