# Database Schema

## Overview
This document defines the database schema for the marketplace platform. Use this as a reference when implementing Supabase tables or any other database solution.

## Tables

### users
User accounts for customers, sellers, and admins.

\`\`\`json
{
  "id": "uuid (primary key)",
  "email": "string (unique, required)",
  "name": "string (required)",
  "role": "string (customer|seller|admin, default: customer)",
  "avatar_url": "string (nullable)",
  "phone": "string (nullable)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Indexes:**
- `email` (unique)
- `role`

---

### shops
Seller shops/stores.

\`\`\`json
{
  "id": "uuid (primary key)",
  "owner_id": "uuid (foreign key -> users.id)",
  "name": "string (required)",
  "slug": "string (unique, required)",
  "description": "text (nullable)",
  "cnpj": "string (nullable)",
  "logo_url": "string (nullable)",
  "banner_url": "string (nullable)",
  "rating": "decimal (0-5, default: 0)",
  "total_sales": "integer (default: 0)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Indexes:**
- `owner_id`
- `slug` (unique)

---

### products
Products listed by sellers.

\`\`\`json
{
  "id": "uuid (primary key)",
  "shop_id": "uuid (foreign key -> shops.id)",
  "title": "string (required)",
  "description": "text (nullable)",
  "price_cents": "integer (required)",
  "compare_at_price_cents": "integer (nullable)",
  "stock": "integer (default: 0)",
  "sku": "string (nullable)",
  "category": "string (nullable)",
  "tags": "string[] (nullable)",
  "variants": "jsonb (nullable)",
  "images": "string[] (required)",
  "is_active": "boolean (default: true)",
  "rating": "decimal (0-5, default: 0)",
  "review_count": "integer (default: 0)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Variants Structure:**
\`\`\`json
[
  {
    "id": "string",
    "sku": "string",
    "size": "string",
    "color": "string",
    "stock": "integer",
    "price_cents": "integer"
  }
]
\`\`\`

**Indexes:**
- `shop_id`
- `category`
- `is_active`

---

### orders
Customer orders.

\`\`\`json
{
  "id": "uuid (primary key)",
  "user_id": "uuid (foreign key -> users.id)",
  "shop_id": "uuid (foreign key -> shops.id)",
  "status": "string (created|paid|processing|shipped|delivered|cancelled, default: created)",
  "total_cents": "integer (required)",
  "subtotal_cents": "integer (required)",
  "shipping_cents": "integer (required)",
  "items": "jsonb (required)",
  "shipping_address": "jsonb (required)",
  "shipping": "jsonb (nullable)",
  "payment": "jsonb (nullable)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Items Structure:**
\`\`\`json
[
  {
    "product_id": "uuid",
    "variant_id": "string (nullable)",
    "title": "string",
    "quantity": "integer",
    "price_cents": "integer"
  }
]
\`\`\`

**Shipping Structure:**
\`\`\`json
{
  "carrier": "string",
  "service": "string",
  "tracking_code": "string",
  "status": "string",
  "estimated_delivery": "date"
}
\`\`\`

**Payment Structure:**
\`\`\`json
{
  "provider": "string (mercadopago)",
  "payment_id": "string",
  "payment_method": "string",
  "paid_at": "timestamp"
}
\`\`\`

**Indexes:**
- `user_id`
- `shop_id`
- `status`
- `created_at`

---

### reviews
Product reviews.

\`\`\`json
{
  "id": "uuid (primary key)",
  "product_id": "uuid (foreign key -> products.id)",
  "user_id": "uuid (foreign key -> users.id)",
  "order_id": "uuid (foreign key -> orders.id)",
  "rating": "integer (1-5, required)",
  "title": "string (nullable)",
  "comment": "text (nullable)",
  "images": "string[] (nullable)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Indexes:**
- `product_id`
- `user_id`
- `rating`

---

### messages
Chat messages between users and sellers.

\`\`\`json
{
  "id": "uuid (primary key)",
  "conversation_id": "uuid (required)",
  "sender_id": "uuid (foreign key -> users.id)",
  "receiver_id": "uuid (foreign key -> users.id)",
  "product_id": "uuid (foreign key -> products.id, nullable)",
  "message": "text (required)",
  "is_read": "boolean (default: false)",
  "created_at": "timestamp (default: now())"
}
\`\`\`

**Indexes:**
- `conversation_id`
- `sender_id`
- `receiver_id`
- `created_at`

---

### payments
Payment transaction records.

\`\`\`json
{
  "id": "uuid (primary key)",
  "order_id": "uuid (foreign key -> orders.id)",
  "provider": "string (mercadopago)",
  "provider_payment_id": "string (required)",
  "amount_cents": "integer (required)",
  "status": "string (pending|approved|rejected|cancelled)",
  "payment_method": "string (nullable)",
  "metadata": "jsonb (nullable)",
  "created_at": "timestamp (default: now())",
  "updated_at": "timestamp (default: now())"
}
\`\`\`

**Indexes:**
- `order_id`
- `provider_payment_id`
- `status`

---

## Row Level Security (RLS) Policies

### users
- Users can read their own data
- Users can update their own data
- Admins can read all users

### shops
- Anyone can read active shops
- Shop owners can update their own shops
- Admins can manage all shops

### products
- Anyone can read active products
- Shop owners can manage their own products
- Admins can manage all products

### orders
- Users can read their own orders
- Shop owners can read orders for their products
- Admins can read all orders

### reviews
- Anyone can read reviews
- Users can create reviews for their completed orders
- Users can update/delete their own reviews

### messages
- Users can read messages where they are sender or receiver
- Users can create messages

### payments
- Users can read their own payment records
- Shop owners can read payments for their orders
- Admins can read all payments

---

## SQL Scripts

See `/scripts` folder for:
- `001_create_tables.sql` - Initial table creation
- `002_create_indexes.sql` - Index creation
- `003_enable_rls.sql` - Row Level Security policies
- `004_seed_data.sql` - Sample data for testing
