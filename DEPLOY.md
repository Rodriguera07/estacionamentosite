# 🚀 GUIA DE DEPLOY SEGURO - ERIVAN ESTACIONAMENTO

## Pré-requisitos

- Node.js v18+
- npm ou pnpm
- Acesso SSH ao servidor
- Domínio próprio
- Certificado SSL (Let's Encrypt gratuito)

---

## 1. PREPARAÇÃO DO SERVIDOR

### 1.1 Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 1.2 Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 1.3 Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.4 Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 2. CLONAR E CONFIGURAR REPOSITÓRIO

### 2.1 Clonar Repositório
```bash
cd /var/www
git clone https://github.com/Rodriguera07/estacionamentosite.git
cd estacionamentosite
```

### 2.2 Criar Arquivo .env
```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
EOF
```

### 2.3 Instalar Dependências
```bash
npm install --production
```

---

## 3. CONFIGURAR HTTPS/SSL

### 3.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Gerar Certificado SSL
```bash
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Seguir as instruções e confirmar aceitar os termos.

---

## 4. CONFIGURAR NGINX

### 4.1 Criar Arquivo de Configuração
```bash
sudo tee /etc/nginx/sites-available/erivan-estacionamento > /dev/null << 'EOF'
upstream app {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    server_tokens off;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location ~ /\. {
        deny all;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1024;
}
EOF
```

### 4.2 Ativar Configuração
```bash
sudo ln -s /etc/nginx/sites-available/erivan-estacionamento /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. CONFIGURAR PM2

### 5.1 Criar Arquivo de Configuração
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'erivan-estacionamento',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true
  }]
};
EOF
```

### 5.2 Iniciar com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
sudo pm2 startup systemd -u $USER --hp /home/$USER
```

---

## 6. CONFIGURAR FIREWALL

### 6.1 UFW (Uncomplicated Firewall)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 7. RENOVAÇÃO AUTOMÁTICA DE CERTIFICADOS

### 7.1 Configurar Cron
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Ou manualmente:
```bash
sudo crontab -e
# Adicionar:
0 12 * * * certbot renew --quiet && systemctl reload nginx
```

---

## 8. MONITORAMENTO E LOGS

### 8.1 Ver Logs da Aplicação
```bash
pm2 logs erivan-estacionamento
```

### 8.2 Ver Logs do Nginx
```bash
sudo tail -f /var/log/nginx/erivan-estacionamento.error.log
```

### 8.3 Monitorar Processo
```bash
pm2 monit
```

---

## 9. BACKUP E RECUPERAÇÃO

### 9.1 Criar Script de Backup
```bash
cat > /home/$USER/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d)
mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/estacionamento-$DATE.tar.gz /var/www/estacionamentosite/

# Backup de certificados SSL
sudo tar -czf $BACKUP_DIR/ssl-$DATE.tar.gz /etc/letsencrypt/

echo "Backup concluído em $BACKUP_DIR"
EOF

chmod +x /home/$USER/backup.sh
```

### 9.2 Agendar Backup Diário
```bash
crontab -e
# Adicionar:
0 3 * * * /home/$USER/backup.sh
```

---

## 10. SEGURANÇA ADICIONAL

### 10.1 Instalar Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.2 Configurar Fail2Ban
```bash
sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
findtime = 600
bantime = 3600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl restart fail2ban
```

### 10.3 Habilitar Automatic Security Updates
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 11. CHECKLIST PRÉ-DEPLOY

- [ ] Node.js instalado (v18+)
- [ ] Git clonado com sucesso
- [ ] npm install executado
- [ ] .env criado e configurado
- [ ] Certificado SSL gerado
- [ ] Nginx configurado
- [ ] PM2 configurado
- [ ] Firewall ativo
- [ ] Backup agendado
- [ ] Fail2Ban instalado
- [ ] Logs configurados

---

## 12. APÓS O DEPLOY

### 12.1 Testar Acesso
```bash
# HTTP deve redirecionar para HTTPS
curl -I http://seu-dominio.com

# HTTPS deve funcionar
curl -I https://seu-dominio.com
```

### 12.2 Verificar Certificado SSL
```bash
# Validade do certificado
openssl x509 -in /etc/letsencrypt/live/seu-dominio.com/cert.pem -noout -dates

# Verificar via online
https://www.sslshopper.com/ssl-checker.html
```

### 12.3 Testar Segurança
```bash
# Rodar testes de segurança
bash test-security.sh
```

---

## 13. COMMANDS ÚTEIS

```bash
# Ver status da aplicação
pm2 status
pm2 info erivan-estacionamento

# Reiniciar aplicação
pm2 restart erivan-estacionamento

# Parar aplicação
pm2 stop erivan-estacionamento

# Ver logs em tempo real
pm2 logs erivan-estacionamento --lines 50

# Recarregar Nginx
sudo systemctl reload nginx

# Ver status do Nginx
sudo systemctl status nginx

# Teste de certificado SSL
sudo certbot renew --dry-run
```

---

## 14. TROUBLESHOOTING

### Porta 3000 em uso
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Nginx não inicia
```bash
sudo nginx -t
sudo journalctl -xe
```

### Certificado SSL expirado
```bash
sudo certbot renew --force-renewal
```

### PM2 não inicia com reboot
```bash
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

---

## 📞 Suporte

Para problemas, consulte:
- Logs: `/var/log/nginx/` e `pm2 logs`
- Certificado: `sudo certbot certificates`
- Firewall: `sudo ufw status`

---

**Ultima atualização:** 22 de junho de 2026

🔒 Deploy seguro concluído!
