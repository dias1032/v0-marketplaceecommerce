-- Add MercadoPago specific fields to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS mercadopago_collector_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';

-- Add MercadoPago payment tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_preference_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);

-- Create index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_preference ON orders(payment_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- Add comment explaining the fields
COMMENT ON COLUMN stores.mercadopago_collector_id IS 'MercadoPago collector ID for receiving split payments';
COMMENT ON COLUMN stores.subscription_id IS 'MercadoPago subscription ID for recurring billing';
COMMENT ON COLUMN stores.subscription_status IS 'Status of seller subscription: active, pending, cancelled, inactive';
COMMENT ON COLUMN orders.payment_preference_id IS 'MercadoPago preference ID used to create the checkout';
COMMENT ON COLUMN orders.payment_id IS 'MercadoPago payment ID after payment is processed';
COMMENT ON COLUMN orders.payment_status IS 'MercadoPago payment status: approved, pending, rejected, etc';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: credit_card, debit_card, pix, boleto, etc';
