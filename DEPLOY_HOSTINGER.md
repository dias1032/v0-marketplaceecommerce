# Deploy do Vestti Marketplace na VPS Hostinger

Guia completo para fazer deploy do projeto na VPS da Hostinger com Node.js + MySQL + Nginx + PM2.

---

## Pré-requisitos

- VPS na Hostinger com acesso SSH
- Node.js 18+ instalado na VPS
- MySQL instalado ou acesso ao MySQL da Hostinger
- Domínio apontando para o IP da VPS (opcional, mas recomendado)

---

## Passo 1: Configurar MySQL

### 1.1 Acessar MySQL

\`\`\`bash
# Via SSH na VPS
mysql -u root -p
\`\`\`

### 1.2 Criar banco de dados e usuário

\`\`\`sql
-- Criar banco
CREATE DATABASE vestti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário (troque 'sua_senha_segura' por uma senha forte)
CREATE USER 'vestti_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';

-- Dar permissões
GRANT ALL PRIVILEGES ON vestti.* TO 'vestti_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
\`\`\`

### 1.3 Executar o Schema SQL

\`\`\`bash
# Importar o schema
mysql -u vestti_user -p vestti < scripts/mysql_schema.sql
\`\`\`

Ou via phpMyAdmin:
1. Acesse o phpMyAdmin do Hostinger
2. Selecione o banco `vestti`
3. Vá em "Importar"
4. Selecione o arquivo `scripts/mysql_schema.sql`
5. Clique em "Executar"

---

## Passo 2: Configurar o Projeto

### 2.1 Clonar/Upload do projeto

\`\`\`bash
# Via Git
cd /var/www
git clone SEU_REPOSITORIO.git vestti
cd vestti

# Ou via upload manual (FileZilla, SCP, etc)
\`\`\`

### 2.2 Criar arquivo .env

\`\`\`bash
cd /var/www/vestti
nano .env
\`\`\`

Conteúdo do `.env`:

\`\`\`env
# Database - MySQL Hostinger
DB_HOST=localhost
DB_USER=vestti_user
DB_PASSWORD=sua_senha_segura
DB_NAME=vestti

# JWT Secret - GERE UMA CHAVE ALEATÓRIA!
# Gerar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=cole_sua_chave_gerada_aqui

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_mercadopago

# URL do Site
NEXT_PUBLIC_SITE_URL=https://seudominio.com

# Node Environment
NODE_ENV=production
\`\`\`

**Para gerar JWT_SECRET:**
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

### 2.3 Instalar dependências e build

\`\`\`bash
npm install
npm run build
\`\`\`

---

## Passo 3: Configurar PM2

### 3.1 Instalar PM2 globalmente

\`\`\`bash
npm install -g pm2
\`\`\`

### 3.2 Iniciar aplicação com PM2

\`\`\`bash
cd /var/www/vestti
pm2 start npm --name "vestti" -- start
\`\`\`

### 3.3 Configurar PM2 para iniciar no boot

\`\`\`bash
pm2 save
pm2 startup
# Execute o comando que aparecer na tela
\`\`\`

### 3.4 Comandos úteis do PM2

\`\`\`bash
# Ver status
pm2 status

# Ver logs
pm2 logs vestti

# Reiniciar
pm2 restart vestti

# Parar
pm2 stop vestti

# Monitorar
pm2 monit
\`\`\`

---

## Passo 4: Configurar Nginx

### 4.1 Instalar Nginx (se não tiver)

\`\`\`bash
sudo apt update
sudo apt install nginx
\`\`\`

### 4.2 Criar configuração do site

\`\`\`bash
sudo nano /etc/nginx/sites-available/vestti
\`\`\`

Conteúdo:

\`\`\`nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para arquivos estáticos
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Arquivos públicos
    location /public {
        alias /var/www/vestti/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

### 4.3 Ativar site

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/vestti /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

---

## Passo 5: SSL com Let's Encrypt (HTTPS)

### 5.1 Instalar Certbot

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
\`\`\`

### 5.2 Obter certificado

\`\`\`bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
\`\`\`

### 5.3 Renovação automática

\`\`\`bash
# Testar renovação
sudo certbot renew --dry-run
\`\`\`

---

## Passo 6: Criar Usuário Admin

### Opção 1: Via SQL

Primeiro, gere o hash da senha:

\`\`\`bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA_ADMIN', 10))"
\`\`\`

Depois execute no MySQL:

\`\`\`sql
INSERT INTO users (email, password_hash, full_name, role) VALUES
('seu-email@dominio.com', 'HASH_GERADO_ACIMA', 'Seu Nome', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin', password_hash = 'HASH_GERADO_ACIMA';
\`\`\`

### Opção 2: Via endpoint (se preferir criar)

O projeto já vem com um admin padrão:
- Email: `jdias2221@gmail.com`
- Senha: `admin123` (TROQUE IMEDIATAMENTE!)

---

## Passo 7: Configurar MercadoPago

### 7.1 Obter credenciais

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em "Suas integrações" → "Criar aplicação"
3. Copie o Access Token (produção)
4. Copie a Public Key

### 7.2 Configurar Webhooks

No painel do MercadoPago:
1. Vá em "Webhooks"
2. Adicione URL: `https://seudominio.com/api/webhooks/mercadopago`
3. Selecione eventos: `payment`

---

## Debug e Troubleshooting

### Ver logs da aplicação

\`\`\`bash
pm2 logs vestti
\`\`\`

### Ver logs do Nginx

\`\`\`bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
\`\`\`

### Testar conexão MySQL

\`\`\`bash
mysql -u vestti_user -p -e "SELECT 1"
\`\`\`

### Verificar portas

\`\`\`bash
# Verificar se a porta 3000 está em uso
sudo lsof -i :3000

# Verificar firewall
sudo ufw status
\`\`\`

### Problemas comuns

**1. Erro de conexão MySQL**
- Verifique host, usuário e senha no `.env`
- Confirme que o usuário tem permissão no banco

**2. 502 Bad Gateway**
- Verifique se o PM2 está rodando: `pm2 status`
- Reinicie: `pm2 restart vestti`

**3. Erro de permissão**
\`\`\`bash
sudo chown -R $USER:$USER /var/www/vestti
\`\`\`

**4. Memória insuficiente**
\`\`\`bash
# Criar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
\`\`\`

---

## Estrutura de Diretórios

\`\`\`
/var/www/vestti/
├── .env                    # Variáveis de ambiente (NÃO commitar!)
├── .next/                  # Build do Next.js
├── app/                    # Páginas e API routes
├── components/             # Componentes React
├── lib/                    # Bibliotecas (db, auth, etc)
├── public/                 # Arquivos estáticos
├── scripts/
│   └── mysql_schema.sql    # Schema do banco
├── package.json
└── DEPLOY_HOSTINGER.md     # Este arquivo
\`\`\`

---

## Atualizações Futuras

\`\`\`bash
cd /var/www/vestti

# Baixar atualizações
git pull origin main

# Instalar novas dependências
npm install

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart vestti
\`\`\`

---

## Contato e Suporte

- Documentação Next.js: https://nextjs.org/docs
- Documentação MercadoPago: https://www.mercadopago.com.br/developers
- Hostinger VPS: https://support.hostinger.com

---

**Projeto pronto! Agora é só seguir os passos acima.**
