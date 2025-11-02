-- Function to update follower count
CREATE OR REPLACE FUNCTION update_store_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stores
    SET follower_count = follower_count + 1
    WHERE id = NEW.store_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stores
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.store_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_follower_count
AFTER INSERT OR DELETE ON public.store_followers
FOR EACH ROW EXECUTE FUNCTION update_store_follower_count();

-- Function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.store_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.store_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.store_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.store_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Function to create notification when store is followed
CREATE OR REPLACE FUNCTION notify_store_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  store_seller_id UUID;
  store_name TEXT;
  follower_name TEXT;
BEGIN
  SELECT seller_id, name INTO store_seller_id, store_name
  FROM public.stores
  WHERE id = NEW.store_id;
  
  SELECT full_name INTO follower_name
  FROM public.profiles
  WHERE id = NEW.buyer_id;
  
  INSERT INTO public.notifications (user_id, type, title, message, link_url)
  VALUES (
    store_seller_id,
    'new_follower',
    'Novo seguidor!',
    follower_name || ' começou a seguir ' || store_name,
    '/seller/dashboard'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_store_on_follow
AFTER INSERT ON public.store_followers
FOR EACH ROW EXECUTE FUNCTION notify_store_on_follow();

-- Function to notify followers when store creates a post
CREATE OR REPLACE FUNCTION notify_followers_on_new_post()
RETURNS TRIGGER AS $$
DECLARE
  follower_record RECORD;
  store_name TEXT;
BEGIN
  SELECT name INTO store_name
  FROM public.stores
  WHERE id = NEW.store_id;
  
  FOR follower_record IN
    SELECT sf.buyer_id
    FROM public.store_followers sf
    JOIN public.notification_preferences np ON sf.buyer_id = np.user_id
    WHERE sf.store_id = NEW.store_id
    AND np.new_products_from_followed = TRUE
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link_url)
    VALUES (
      follower_record.buyer_id,
      'store_post',
      'Nova publicação de ' || store_name,
      LEFT(NEW.content, 100),
      '/feed'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_followers_on_new_post
AFTER INSERT ON public.store_posts
FOR EACH ROW EXECUTE FUNCTION notify_followers_on_new_post();
