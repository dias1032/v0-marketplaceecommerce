-- Add product SKU/code field
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Add order code field (different from order_number for tracking)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_code TEXT UNIQUE;

-- Function to generate product SKU
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TEXT AS $$
DECLARE
  new_sku TEXT;
  sku_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate SKU: VEST-XXXXXXXX (8 random alphanumeric characters)
    new_sku := 'VEST-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if SKU already exists
    SELECT EXISTS(SELECT 1 FROM public.products WHERE sku = new_sku) INTO sku_exists;
    
    -- Exit loop if SKU is unique
    EXIT WHEN NOT sku_exists;
  END LOOP;
  
  RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate order code: ORD-XXXXXXXXXX (10 random alphanumeric characters)
    new_code := 'ORD-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 10));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate SKU for new products
CREATE OR REPLACE FUNCTION set_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku := generate_product_sku();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_product_sku
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_sku();

-- Trigger to auto-generate order code for new orders
CREATE OR REPLACE FUNCTION set_order_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL THEN
    NEW.order_code := generate_order_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_code();

-- Update existing products with SKUs
UPDATE public.products SET sku = generate_product_sku() WHERE sku IS NULL;

-- Update existing orders with order codes
UPDATE public.orders SET order_code = generate_order_code() WHERE order_code IS NULL;
