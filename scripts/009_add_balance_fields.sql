-- Add balance fields to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0.00;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON public.messages(conversation_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_receiver ON public.messages(conversation_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_type ON public.transactions(store_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
