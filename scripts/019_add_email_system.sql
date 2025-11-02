-- Email system tables for Supabase email migration
-- Admin email: jdias2221@gmail.com

-- Email templates table (editable by admin)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'order_confirmation_buyer', 'seller_verification'
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL, -- HTML template with {{placeholders}}
  variables JSONB DEFAULT '[]'::jsonb, -- Array of available variables
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs table (track all sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, bounced
  provider_tx_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscriptions table (manage unsubscribes)
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  bounce_count INTEGER DEFAULT 0,
  last_bounce_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email settings to settings table
INSERT INTO settings (key, value, category, description) VALUES
  ('email_sender_address', '"contato@vestti.shop"', 'email', 'Endereço de email remetente padrão'),
  ('email_sender_name', '"Vestti"', 'email', 'Nome do remetente de emails'),
  ('email_admin_address', '"jdias2221@gmail.com"', 'email', 'Email do administrador para notificações'),
  ('email_retry_attempts', '3', 'email', 'Número de tentativas de reenvio'),
  ('email_retry_delay', '300', 'email', 'Delay entre tentativas (segundos)'),
  ('email_smtp_fallback_host', '""', 'email', 'Host SMTP de fallback'),
  ('email_smtp_fallback_port', '587', 'email', 'Porta SMTP de fallback'),
  ('email_smtp_fallback_user', '""', 'email', 'Usuário SMTP de fallback'),
  ('email_smtp_fallback_pass', '""', 'email', 'Senha SMTP de fallback (criptografada)')
ON CONFLICT (key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (key, name, subject, body, variables) VALUES
  ('order_confirmation_buyer', 'Confirmação de Pedido (Comprador)', 'Pedido Confirmado #{{order_code}}', 
   '<h1>Pedido Confirmado!</h1><p>Olá {{buyer_name}},</p><p>Seu pedido #{{order_code}} foi confirmado.</p>',
   '["order_code", "buyer_name", "order_total", "order_items", "shipping_address"]'::jsonb),
  
  ('order_confirmation_seller', 'Nova Venda (Vendedor)', 'Nova Venda! Pedido #{{order_code}}',
   '<h1>Nova Venda!</h1><p>Olá {{seller_name}},</p><p>Você recebeu um novo pedido #{{order_code}}.</p>',
   '["order_code", "seller_name", "store_name", "order_items", "commission", "earnings"]'::jsonb),
  
  ('seller_verification_request', 'Solicitação de Verificação (Admin)', 'Nova Solicitação de Verificação - {{seller_name}}',
   '<h1>Nova Solicitação</h1><p>Vendedor: {{seller_name}}</p><p>Email: {{seller_email}}</p>',
   '["seller_name", "seller_email", "cpf_cnpj", "phone", "address", "approve_url", "reject_url"]'::jsonb),
  
  ('seller_approved', 'Loja Aprovada (Vendedor)', 'Sua loja foi aprovada!',
   '<h1>Parabéns!</h1><p>Sua loja foi aprovada e está ativa na Vestti!</p>',
   '["seller_name", "dashboard_url"]'::jsonb),
  
  ('seller_rejected', 'Solicitação Rejeitada (Vendedor)', 'Atualização sobre sua solicitação',
   '<h1>Atualização</h1><p>Sua solicitação não foi aprovada. Revise e tente novamente.</p>',
   '["seller_name", "retry_url"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY "Admin can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Public can read templates (for preview)
CREATE POLICY "Public can read email templates" ON email_templates
  FOR SELECT USING (true);

-- Admin can view all email logs
CREATE POLICY "Admin can view email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own email logs
CREATE POLICY "Users can view their email logs" ON email_logs
  FOR SELECT USING (
    to_email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Admin can manage subscriptions
CREATE POLICY "Admin can manage subscriptions" ON email_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can manage their own subscription
CREATE POLICY "Users can manage their subscription" ON email_subscriptions
  FOR ALL USING (
    email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

CREATE TRIGGER email_subscriptions_updated_at
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
