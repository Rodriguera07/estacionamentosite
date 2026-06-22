# 🔐 CHECKLIST DE SEGURANÇA - MANUTENÇÃO CONTÍNUA

## Objetivo
Manter o site Erivan Estacionamento seguro através de verificações regulares e atualizações.

---

## 📅 CHECKLIST DIÁRIO (Todos os dias)

- [ ] Verificar status da aplicação
  ```bash
  pm2 status
  ```

- [ ] Revisar logs de erro
  ```bash
  pm2 logs erivan-estacionamento --lines 100 | grep ERROR
  sudo tail -50 /var/log/nginx/erivan-estacionamento.error.log
  ```

- [ ] Verificar uso de recursos
  ```bash
  pm2 monit
  free -h
  df -h
  ```

- [ ] Não há alertas de Fail2Ban
  ```bash
  sudo fail2ban-client status sshd
  ```

---

## 🗓️ CHECKLIST SEMANAL (Todo domingo)

- [ ] Atualizar dependências npm
  ```bash
  npm update
  npm audit
  ```

- [ ] Verificar certificado SSL
  ```bash
  openssl x509 -in /etc/letsencrypt/live/seu-dominio.com/cert.pem -noout -dates
  ```

- [ ] Revisar configuração de firewall
  ```bash
  sudo ufw status verbose
  ```

- [ ] Executar testes de segurança
  ```bash
  bash test-security.sh
  ```

- [ ] Criar backup manual
  ```bash
  bash backup.sh
  ```

- [ ] Revisar logs de acesso estranhos
  ```bash
  sudo tail -100 /var/log/nginx/erivan-estacionamento.access.log | grep "GET /\." 
  sudo tail -100 /var/log/nginx/erivan-estacionamento.access.log | grep "POST /admin"
  ```

---

## 📆 CHECKLIST MENSAL (Primeiro dia do mês)

- [ ] Atualizar sistema operacional
  ```bash
  sudo apt update
  sudo apt upgrade
  ```

- [ ] Executar auditoria de segurança completa
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] Verificar certificado SSL (validade)
  ```bash
  sudo certbot certificates
  ```

- [ ] Revisar logs do Fail2Ban
  ```bash
  sudo fail2ban-client status
  ```

- [ ] Testar recuperação do backup
  - Restaurar um backup antigo em servidor de teste
  - Verificar integridade dos dados

- [ ] Revisar permissões de arquivo
  ```bash
  ls -la /var/www/estacionamentosite/
  ls -la /home/$USER/.ssh/
  ```

- [ ] Verifiar atualizações de segurança do Node.js
  ```bash
  node --version
  npm --version
  ```

- [ ] Revisar relatório de tráfego
  ```bash
  wc -l /var/log/nginx/erivan-estacionamento.access.log
  du -sh /var/log/nginx/
  ```

---

## 🔄 CHECKLIST TRIMESTRAL (a cada 3 meses)

- [ ] Penetration testing
  - Testar manualmente para vulnerabilidades conhecidas
  - Utilizar ferramentas como OWASP ZAP ou Burp Suite

- [ ] Auditoria de código
  - Revisar alterações recentes
  - Verificar boas práticas

- [ ] Atualizar documentação de segurança
  - [SEGURANCA.md](SEGURANCA.md)
  - [DEPLOY.md](DEPLOY.md)

- [ ] Revisar configuração de CORS
  ```javascript
  // No server.js
  const corsOptions = {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [...]
  };
  ```

- [ ] Atualizar políticas de segurança
  - Revisar rate limiting
  - Atualizar CSP se necessário

- [ ] Executar teste de carga
  ```bash
  # Usando Apache Bench
  ab -n 1000 -c 10 https://seu-dominio.com/
  ```

- [ ] Rotacionar logs antigos
  ```bash
  sudo journalctl --vacuum=30d
  sudo logrotate -f /etc/logrotate.conf
  ```

---

## 🔐 CHECKLIST ANUAL (uma vez por ano)

- [ ] Audit de segurança completa por terceiros
  - Contratar especialista em segurança web

- [ ] Atualizar certificado SSL
  ```bash
  sudo certbot renew --force-renewal
  ```

- [ ] Rever e atualizar todas as dependências
  ```bash
  npm outdated
  npm update
  ```

- [ ] Teste de Business Continuity
  - Simular desastre
  - Testar plano de recuperação

- [ ] Renovar domínio
  - Verifiar expiração: `whois seu-dominio.com`

- [ ] Rever e atualizar política de privacidade
  - Conformidade com LGPD
  - Termos de serviço

- [ ] Atualizar plano de resposta a incidentes
  - Documentar procedimentos
  - Treinar equipe

---

## 🚨 RESPOSTAS A INCIDENTES

### Se Detectar Ataque XSS
```bash
# 1. Verificar logs
tail -100 /var/log/nginx/erivan-estacionamento.access.log | grep "<script"

# 2. Atualizar sanitização
# Editar: security.js e server.js

# 3. Limpar cache do navegador (informar usuários)
# 4. Atualizar CSP
```

### Se Detectar SQL Injection (se usar BD)
```bash
# 1. Revogação de credenciais do BD
# 2. Restaurar do backup
# 3. Aplicar patches
# 4. Alterar senhas
```

### Se Detectar Rate Limiting Bypass
```bash
# 1. Aumentar limites em server.js
# 2. Adicionar validação extra
# 3. Ativar WAF/Cloudflare
```

### Se Certificado SSL for Comprometido
```bash
# 1. Revogar certificado
sudo certbot revoke --cert-path /etc/letsencrypt/live/seu-dominio.com/cert.pem

# 2. Gerar novo
sudo certbot certonly --nginx -d seu-dominio.com

# 3. Atualizar Nginx
sudo systemctl reload nginx
```

---

## 📊 MÉTRICAS DE SEGURANÇA A MONITORAR

### Performance
- [ ] Tempo de resposta < 200ms
- [ ] Taxa de erro < 1%
- [ ] Uptime > 99.9%

### Segurança
- [ ] 0 vulnerabilidades conhecidas (npm audit)
- [ ] 0 tentativas de XSS bem-sucedidas
- [ ] 0 brechas de dados

### Rate Limiting
- [ ] Máximo 100 req/IP em 15 min
- [ ] Máximo 10 contatos/IP em 1 hora
- [ ] Taxa de bloqueio normal < 0.1%

---

## 🔗 LINKS DE REFERÊNCIA

### Monitoramento
- [PM2 Docs](https://pm2.keymetrics.io/)
- [Nginx Monitoring](https://nginx.org/en/docs/)
- [Fail2Ban](https://www.fail2ban.org/)

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [SSL Labs Guide](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)

### Certificados
- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot](https://certbot.eff.org/)

### Ferramentas de Teste
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## 📝 REGISTRO DE MUDANÇAS

Manter histórico de todas as mudanças de segurança:

```
DATA       | MUDANÇA                        | VERSÃO | STATUS
-----------|--------------------------------|--------|--------
2026-06-22 | Implementação inicial          | 1.0.0  | ✓ Ativo
2026-07-22 | Atualizar dependências         | 1.0.1  | ✓ Ativo
2026-08-22 | Adicionar WAF (Cloudflare)     | 1.1.0  | ⏳ Planejado
```

---

## 📞 CONTATOS DE EMERGÊNCIA

- **Segurança**: seguranca@seu-dominio.com
- **Admin**: admin@seu-dominio.com
- **Suporte**: suporte@seu-dominio.com

---

## ✅ ASSINATURA

- Revisor: _________________
- Data: _________________
- Próxima revisão: _________________

---

**Documento de Segurança - Último atualizado: 22 de junho de 2026**

🔒 Segurança é responsabilidade de todos!
