# 🚀 Guia de Deploy - Refaz

Instruções para colocar Refaz em produção em diferentes plataformas.

---

## 📋 Opções de Deploy

1. [Vercel + Railway](#vercel--railway) — Rápido, gratuito (tier inicial)
2. [Docker Compose + VPS](#docker-compose--vps) — DigitalOcean, AWS, Linode
3. [AWS App Runner](#aws-app-runner) — Serverless gerenciado
4. [Render](#render) — Simples, integração Git

---

## Vercel + Railway

### ✨ Melhor para: Startup/Prototipo

**Frontend (Vercel):**

1. Faça push do projeto para GitHub
2. Conecte Vercel: https://vercel.com/new
3. Selecione `QUIZ DIGITAL/client`
4. Variáveis de ambiente:
   - `REACT_APP_API_URL=https://seu-backend.rail.app`
5. Deploy automático a cada push

**Backend (Railway):**

1. Conecte Railway: https://railway.app
2. Novo projeto via GitHub
3. Selecione `QUIZ DIGITAL`
4. Configure build: `server/package.json`
5. Variáveis:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CORS_ORIGIN=https://seu-app.vercel.app`
6. Deploy

**Custo:** Vercel (free), Railway (free tier ~$5/mês depois)

---

## Docker Compose + VPS

### ✨ Melhor para: Controle total, performance

**Pré-requisitos:**
- VPS (DigitalOcean, AWS EC2, Linode, etc.)
- SSH access
- Docker & Docker Compose instalados

**Setup:**

```bash
# 1. SSH into server
ssh root@seu-servidor.com

# 2. Clone repository
git clone https://github.com/seu-usuario/refaz.git
cd refaz

# 3. Copy env example
cp .env.example .env.local

# 4. Edit environment
nano .env.local
# Define:
# CORS_ORIGIN=https://seu-dominio.com
# REACT_APP_API_URL=https://seu-dominio.com/api

# 5. Build & run
docker-compose up -d --build

# 6. Verify
docker-compose ps
# Should show both running and healthy
```

**Com Nginx Reverse Proxy:**

```bash
# /etc/nginx/sites-available/refaz
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
    }
}
```

**SSL com Let's Encrypt:**

```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com
```

**Custo:** ~$5-20/mês VPS + domínio

---

## AWS App Runner

### ✨ Melhor para: Serverless, escalabilidade automática

**1. Prepare repositório:**
```bash
git push origin main
```

**2. Frontend (Amplify):**
- Vá para AWS Amplify Console
- Conecte GitHub
- Build settings: `cd client && npm run build`
- Deploy automático

**3. Backend (App Runner):**
- AWS App Runner Console
- Conecte GitHub repo
- Build command: `npm install`
- Start command: `node server/server.js`
- Port: 3001
- Variáveis de ambiente:
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://seu-amplify-app.amplifyapp.com`

**Custo:** ~$1/hora + tráfego (~$0.01/GB)

---

## Render

### ✨ Melhor para: Deploy simplificado

**Frontend:**
1. https://dashboard.render.com → New → Static Site
2. Conecte GitHub
3. Build command: `cd client && npm run build`
4. Publish directory: `client/build`

**Backend:**
1. New → Web Service
2. Conecte GitHub
3. Runtime: Node
4. Build command: `cd server && npm install`
5. Start command: `node server.js`
6. Variáveis de ambiente (conforme acima)

**Custo:** Gratuito com limite, $7/mês para produção

---

## Monitoramento & Manutenção

### Health Checks

```bash
# Todos os containers têm health checks definidos
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backups Database

```bash
# Backup SQLite
docker cp refaz-backend:/app/database.db ./backups/$(date +%Y%m%d).db

# Restaurar
docker cp ./backups/YYYYMMDD.db refaz-backend:/app/database.db
docker-compose restart backend
```

### Logging Remoto (opcional)

```javascript
// server/server.js - com Sentry
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

io.on('error', (error) => {
  Sentry.captureException(error);
});
```

---

## Troubleshooting

### "Connection refused"
```bash
# Verifique se backend está rodando
docker-compose logs backend

# Verifique CORS_ORIGIN
echo $CORS_ORIGIN
```

### "Database locked"
```bash
# Remove lock file
rm server/database.db-journal

# Reinicie
docker-compose restart backend
```

### "Out of memory"
```bash
# Aumente limites no docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Performance Otimizado

### Caching frontend
```javascript
// client/public/.htaccess
<FilesMatch "\.(jpg|jpeg|png|gif|svg|css|js)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Compressão backend
```javascript
// server/server.js
const compression = require('compression');
app.use(compression());
```

### CDN (opcional)
- Cloudflare (free): Ativa automaticamente
- AWS CloudFront: ~$0.084/GB

---

## Security Checklist

- [ ] HTTPS/SSL ativado
- [ ] CORS configurado corretamente
- [ ] Variáveis sensíveis em .env (não no código)
- [ ] Database backup regular
- [ ] Rate limiting implementado
- [ ] Input validation no backend
- [ ] Logs de erro centralizado

---

**Precisa de ajuda? Abra uma issue no GitHub!**
