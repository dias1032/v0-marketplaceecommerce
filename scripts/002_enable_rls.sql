-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stores policies
CREATE POLICY "stores_select_all" ON public.stores FOR SELECT USING (true);
CREATE POLICY "stores_insert_own" ON public.stores FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "stores_update_own" ON public.stores FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "stores_delete_own" ON public.stores FOR DELETE USING (auth.uid() = seller_id);

-- Categories policies (public read, admin write)
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- Products policies
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "products_insert_own_store" ON public.products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "products_update_own_store" ON public.products FOR UPDATE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "products_delete_own_store" ON public.products FOR DELETE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));

-- Orders policies
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.order_items oi JOIN public.stores s ON oi.store_id = s.id WHERE oi.order_id = orders.id AND s.seller_id = auth.uid()));
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

-- Order items policies
CREATE POLICY "order_items_select_related" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND (orders.buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.stores WHERE stores.id = order_items.store_id AND stores.seller_id = auth.uid()))));
CREATE POLICY "order_items_insert_with_order" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.buyer_id = auth.uid()));

-- Reviews policies
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);

-- Store followers policies
CREATE POLICY "store_followers_select_all" ON public.store_followers FOR SELECT USING (true);
CREATE POLICY "store_followers_insert_own" ON public.store_followers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "store_followers_delete_own" ON public.store_followers FOR DELETE USING (auth.uid() = buyer_id);

-- Wishlists policies
CREATE POLICY "wishlists_select_own" ON public.wishlists FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "wishlists_insert_own" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "wishlists_delete_own" ON public.wishlists FOR DELETE USING (auth.uid() = buyer_id);

-- Messages policies
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Ads policies
CREATE POLICY "ads_select_active" ON public.ads FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);
CREATE POLICY "ads_insert_own_store" ON public.ads FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "ads_update_own_store" ON public.ads FOR UPDATE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "ads_delete_own_store" ON public.ads FOR DELETE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));

-- Coupons policies
CREATE POLICY "coupons_select_active" ON public.coupons FOR SELECT USING (is_active = true AND NOW() BETWEEN start_date AND end_date);
CREATE POLICY "coupons_insert_own_store" ON public.coupons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "coupons_update_own_store" ON public.coupons FOR UPDATE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
CREATE POLICY "coupons_delete_own_store" ON public.coupons FOR DELETE USING (EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.seller_id = auth.uid()));
