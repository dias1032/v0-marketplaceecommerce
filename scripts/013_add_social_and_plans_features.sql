-- Add username system to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add constraint for username format (lowercase, numbers, -, _, .)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9._-]+$');

-- Update stores table for new plan system
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_subscription_plan_check,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS subscription_payment_id TEXT,
ADD COLUMN IF NOT EXISTS vip_plan_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vip_plan_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vip_plan_benefits TEXT,
ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Add new constraint for subscription plans
ALTER TABLE public.stores
ADD CONSTRAINT stores_subscription_plan_check 
CHECK (subscription_plan IN ('free', 'mid', 'master'));

-- Create store_posts table for social feed
CREATE TABLE IF NOT EXISTS public.store_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.store_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.store_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create store_vip_subscriptions table
CREATE TABLE IF NOT EXISTS public.store_vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);

-- Create vip_products table (products exclusive to VIP members)
CREATE TABLE IF NOT EXISTS public.vip_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create seller_verification_requests table
CREATE TABLE IF NOT EXISTS public.seller_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  new_products_from_followed BOOLEAN DEFAULT TRUE,
  store_promotions BOOLEAN DEFAULT TRUE,
  wishlist_price_drops BOOLEAN DEFAULT TRUE,
  new_followers BOOLEAN DEFAULT TRUE,
  post_likes BOOLEAN DEFAULT TRUE,
  post_comments BOOLEAN DEFAULT TRUE,
  order_updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_store_posts_store_id ON public.store_posts(store_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_store_vip_subscriptions_store_id ON public.store_vip_subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_vip_subscriptions_user_id ON public.store_vip_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_products_store_id ON public.vip_products(store_id);
CREATE INDEX IF NOT EXISTS idx_seller_verification_requests_status ON public.seller_verification_requests(status);

-- Update commission rates based on plan
UPDATE public.stores
SET commission_rate = CASE
  WHEN subscription_plan = 'free' THEN 15.00
  WHEN subscription_plan = 'mid' THEN 10.00
  WHEN subscription_plan = 'master' THEN 5.00
  ELSE 15.00
END
WHERE commission_rate IS NULL OR commission_rate = 0;
