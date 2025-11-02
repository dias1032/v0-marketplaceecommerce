-- Enable RLS on new tables
ALTER TABLE public.store_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_vip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Store Posts Policies
CREATE POLICY "Anyone can view public store posts"
  ON public.store_posts FOR SELECT
  USING (true);

CREATE POLICY "Store owners can create posts"
  ON public.store_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_posts.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their posts"
  ON public.store_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_posts.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their posts"
  ON public.store_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = store_posts.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Post Likes Policies
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Post Comments Policies
CREATE POLICY "Anyone can view comments"
  ON public.post_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- VIP Subscriptions Policies
CREATE POLICY "Users can view their own VIP subscriptions"
  ON public.store_vip_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_vip_subscriptions.store_id
    AND stores.seller_id = auth.uid()
  ));

CREATE POLICY "Users can create VIP subscriptions"
  ON public.store_vip_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VIP subscriptions"
  ON public.store_vip_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- VIP Products Policies
CREATE POLICY "Anyone can view VIP products"
  ON public.vip_products FOR SELECT
  USING (true);

CREATE POLICY "Store owners can manage VIP products"
  ON public.vip_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = vip_products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Seller Verification Requests Policies
CREATE POLICY "Users can view their own verification requests"
  ON public.seller_verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests"
  ON public.seller_verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests"
  ON public.seller_verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON public.seller_verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Notification Preferences Policies
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
