-- Insert sample banners for the homepage carousel
INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, position, is_active, start_date, end_date)
VALUES
  (
    'Coleção Verão 2025',
    'Até 60% OFF + Frete Grátis',
    '/placeholder.svg?height=400&width=1200',
    '/shop?category=novidades',
    'Comprar Agora',
    1,
    true,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days'
  ),
  (
    'Mega Promoção de Eletrônicos',
    'Descontos imperdíveis em tecnologia',
    '/placeholder.svg?height=400&width=1200',
    '/shop?category=eletronicos',
    'Ver Ofertas',
    2,
    true,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days'
  ),
  (
    'Novidades em Calçados',
    'Conforto e estilo para todos os momentos',
    '/placeholder.svg?height=400&width=1200',
    '/shop?category=calcados',
    'Explorar',
    3,
    true,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days'
  );

-- Insert sample notifications for testing
INSERT INTO public.notifications (user_id, type, title, message, link_url, is_read)
SELECT 
  id,
  'system',
  'Bem-vindo à Vestti!',
  'Obrigado por se cadastrar. Explore nossas ofertas e aproveite!',
  '/shop',
  false
FROM public.profiles
WHERE role = 'buyer'
LIMIT 5;
