# Guia de Deploy no Hostinger

## Pré-requisitos
- VPS na Hostinger com Node.js instalado
- Acesso SSH ao servidor
- MySQL criado no painel da Hostinger

## Passo 1: Configurar MySQL

1. Entre no painel da Hostinger
2. Vá em "Bancos de Dados" → "MySQL"
3. Crie um novo banco de dados chamado `vestti`
4. Anote as credenciais:
   - Host (geralmente localhost ou um IP)
   - Usuário
   - Senha
   - Nome do banco

## Passo 2: Executar o Script SQL

1. No painel da Hostinger, abra o phpMyAdmin
2. Selecione o banco `vestti`
3. Vá em "SQL"
4. Cole e execute o conteúdo do arquivo `scripts/mysql_schema.sql`
5. Verifique se as tabelas foram criadas

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

\`\`\`env
DB_HOST=seu_host_mysql
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=vestti
JWT_SECRET=gere-uma-chave-aleatoria-forte-aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_mercadopago
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
\`\`\`

## Passo 4: Deploy via SSH

\`\`\`bash
# Conecte via SSH
ssh usuario@seu-vps.hostinger.com

# Clone o repositório
git clone seu-repositorio.git vestti
cd vestti

# Instale as dependências
npm install

# Build do projeto
npm run build

# Inicie o servidor
npm start

# Ou use PM2 para manter rodando
npm install -g pm2
pm2 start npm --name "vestti" -- start
pm2 save
pm2 startup
\`\`\`

## Passo 5: Configurar Nginx (Opcional)

Se você quiser usar um domínio, configure o Nginx:

\`\`\`nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Passo 6: Criar Usuário Admin

Execute este SQL no phpMyAdmin para criar seu usuário admin:

\`\`\`sql
-- Primeiro, gere um hash bcrypt da sua senha usando um gerador online
-- ou usando Node.js: bcrypt.hash("sua_senha", 10)

INSERT INTO users (email, password_hash, full_name, role) VALUES
('jdias2221@gmail.com', '$2a$10$SeuHashAqui', 'Admin', 'admin');
\`\`\`

## Suporte

Se você tiver problemas:
1. Verifique os logs: `pm2 logs vestti`
2. Teste a conexão MySQL: tente acessar o banco pelo phpMyAdmin
3. Verifique se o Node.js está rodando: `node --version`
4. Certifique-se que a porta 3000 está liberada no firewall
