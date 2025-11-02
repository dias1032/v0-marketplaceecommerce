-- Insert categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Moda Feminina', 'moda-feminina', 'Roupas e acessórios femininos', '/placeholder.svg?height=200&width=200'),
('Moda Masculina', 'moda-masculina', 'Roupas e acessórios masculinos', '/placeholder.svg?height=200&width=200'),
('Acessórios', 'acessorios', 'Bolsas, joias e acessórios', '/placeholder.svg?height=200&width=200'),
('Eletrônicos', 'eletronicos', 'Gadgets e eletrônicos', '/placeholder.svg?height=200&width=200'),
('Casa & Decoração', 'casa-decoracao', 'Itens para casa e decoração', '/placeholder.svg?height=200&width=200'),
('Brinquedos', 'brinquedos', 'Brinquedos e jogos', '/placeholder.svg?height=200&width=200'),
('Beleza', 'beleza', 'Produtos de beleza e cuidados', '/placeholder.svg?height=200&width=200')
ON CONFLICT (slug) DO NOTHING;
