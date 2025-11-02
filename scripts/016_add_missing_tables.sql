-- Add missing tables for complete seller verification and commission system

-- seller_verifications table (if not exists)
CREATE TABLE IF NOT EXISTS public.seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  address JSONB NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  documents JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- commissions table for tracking platform revenue
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  fee_percent NUMERIC NOT NULL,
  commission_cents INTEGER NOT NULL,
  platform_revenue_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- vip_subscriptions table for store VIP memberships
CREATE TABLE IF NOT EXISTS public.vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  mp_subscription_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, buyer_id)
);

-- chats table (if not exists, merge with messages)
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, buyer_id)
);

-- Update profiles table to include username and role
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Update stores table to add verification and VIP fields
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS vip_price_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vip_enabled BOOLEAN DEFAULT FALSE;

-- Enable RLS on new tables
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_verifications
CREATE POLICY "Users can view their own verifications"
  ON public.seller_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
  ON public.seller_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verifications"
  ON public.seller_verifications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for commissions (sellers can view their own)
CREATE POLICY "Sellers can view their store commissions"
  ON public.commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = commissions.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- RLS Policies for VIP subscriptions
CREATE POLICY "Users can view their VIP subscriptions"
  ON public.vip_subscriptions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Stores can view their VIP subscribers"
  ON public.vip_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = vip_subscriptions.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- RLS Policies for chats
CREATE POLICY "Users can view their chats"
  ON public.chats FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = chats.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_verifications_user_id ON public.seller_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_status ON public.seller_verifications(status);
CREATE INDEX IF NOT EXISTS idx_commissions_store_id ON public.commissions(store_id);
CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON public.commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_store_buyer ON public.vip_subscriptions(store_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_store_buyer ON public.chats(store_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
