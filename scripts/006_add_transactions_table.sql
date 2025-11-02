-- Create transactions table for tracking seller payouts and cashouts
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'commission', 'cashout', 'subscription', 'refund', 'ad_spend')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  bank_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add balance field to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0.00;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Create function to update store balance
CREATE OR REPLACE FUNCTION update_store_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type IN ('sale', 'commission') THEN
      UPDATE stores SET balance = balance + NEW.amount WHERE id = NEW.store_id;
    ELSIF NEW.type IN ('cashout', 'subscription', 'ad_spend') THEN
      UPDATE stores SET balance = balance - NEW.amount WHERE id = NEW.store_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update balance
DROP TRIGGER IF EXISTS trigger_update_store_balance ON public.transactions;
CREATE TRIGGER trigger_update_store_balance
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_store_balance();
