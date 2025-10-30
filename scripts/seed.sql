-- Seed demo data: 3 admins, 10 vendors (mix), 50 products, 20 orders, 10 coupons
-- NOTE: IDs generated via uuid-ossp on insert or client-side scripts.

-- This file contains sample INSERT statements to help populate your Supabase DB for demo.
-- Use with psql or Supabase SQL editor.

-- Example admin user
INSERT INTO users (email, name, role) VALUES ('admin1@demo.com','Admin One','admin');
INSERT INTO users (email, name, role) VALUES ('admin2@demo.com','Admin Two','admin');
INSERT INTO users (email, name, role) VALUES ('admin3@demo.com','Admin Three','admin');

-- Example coupons
INSERT INTO coupons (code, discount_percent, valid_from, valid_to, usage_limit) VALUES ('WELCOME10', 10, now() - interval '1 day', now() + interval '30 day', 100);
INSERT INTO coupons (code, discount_percent, valid_from, valid_to, usage_limit) VALUES ('SUMMER20', 20, now() - interval '1 day', now() + interval '60 day', 50);

-- Add more seeds as needed. For large demo sets use scripts/seed-runner.js to create many rows via Supabase API.
