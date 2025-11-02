-- Add username field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add constraint to ensure username format (@username)
ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^@[a-zA-Z0-9_]{3,30}$');

-- Function to generate username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input TEXT)
RETURNS TEXT AS $$
DECLARE
  base_username TEXT;
  new_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- Extract part before @ from email and clean it
  base_username := '@' || lower(regexp_replace(split_part(email_input, '@', 1), '[^a-z0-9_]', '', 'g'));
  
  -- Ensure minimum length
  IF length(base_username) < 4 THEN
    base_username := base_username || substring(md5(random()::text) from 1 for 4);
  END IF;
  
  -- Truncate if too long
  IF length(base_username) > 31 THEN
    base_username := substring(base_username from 1 for 31);
  END IF;
  
  new_username := base_username;
  
  LOOP
    -- Check if username exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username) INTO username_exists;
    
    EXIT WHEN NOT username_exists;
    
    -- Add counter if username exists
    counter := counter + 1;
    new_username := base_username || counter::text;
  END LOOP;
  
  RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate username for new profiles
CREATE OR REPLACE FUNCTION set_profile_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL THEN
    NEW.username := generate_username_from_email(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_profile_username
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_username();

-- Update existing profiles with usernames
UPDATE public.profiles 
SET username = generate_username_from_email(email) 
WHERE username IS NULL;

-- Add seller_status field to profiles for seller verification flow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_status TEXT CHECK (seller_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';

-- Add seller verification documents
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_documents JSONB DEFAULT '{}'::jsonb;

-- Update stores to use @ format for slug if not already
UPDATE public.stores 
SET slug = '@' || slug 
WHERE slug NOT LIKE '@%';
