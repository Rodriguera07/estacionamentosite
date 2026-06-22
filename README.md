# 🛡️ Erivan Estacionamento - Site Seguro

Site profissional de estacionamento com proteções avançadas contra hackers, fraudes e vulnerabilidades web.

## 📋 Sumário de Segurança

Este projeto implementa múltiplas camadas de segurança:

- ✅ **Helmet.js** - Proteção de headers HTTP
- ✅ **CORS** - Controle de origem cruzada
- ✅ **Rate Limiting** - Proteção contra DDoS
- ✅ **Input Sanitization** - Prevenção de XSS
- ✅ **HPP** - Proteção contra Parameter Pollution
- ✅ **CSP** - Content Security Policy
- ✅ **HSTS** - Força uso de HTTPS
- ✅ **Validação de Formulários** - Cliente e servidor
- ✅ **Proteção de Sessão** - Prevenção de sequestro
- ✅ **Detecção de Fraudes** - Fingerprinting de usuário

---

## 🚀 Como Executar

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,https://seu-dominio.com
```

### 3. Iniciar o Servidor

**Modo de Desenvolvimento:**
```bash
npm run dev
```

**Modo de Produção:**
```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

---

## 🔒 Estrutura de Segurança

### Backend (Node.js + Express)

**Arquivo:** `server.js`

- Helmet.js para headers de segurança
- CORS configurado
- Rate limiting por IP
- Sanitização automática de inputs
- Validação de formulários
- Error handling seguro

### Frontend (HTML + JavaScript)

**Arquivo:** `security.js`

- Sanitização de HTML contra XSS
- Validação de email e telefone
- Proteção de sessão
- Token CSRF
- Detecção de atividades suspeitas
- Logging seguro

### Configuração de Servidor

- **Apache:** `.htaccess`
- **Nginx:** `nginx.conf`

---

## 📝 Endpoints Disponíveis

### GET /
Retorna a página inicial do site (index.html)

### GET /health
Verifica se o servidor está online

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-06-22T10:30:00.000Z"
}
```

### POST /contact
Recebe mensagens de contato com validação

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(13) 99999-9999",
  "message": "Gostaria de fazer uma reserva"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Mensagem recebida com sucesso!"
}
```

**Response (Erro):**
```json
{
  "success": false,
  "message": "Email inválido."
}
```

---

## 🛡️ Proteções Implementadas

### 1. Helmet.js
```javascript
- X-Frame-Options: DENY (bloqueia clickjacking)
- X-Content-Type-Options: nosniff (previne MIME sniffing)
- Strict-Transport-Security: Força HTTPS
- Content-Security-Policy: Controla fontes de conteúdo
```

### 2. CORS
```javascript
- Apenas origens autorizadas podem acessar
- Métodos restritos a GET e POST
- Credenciais validadas
```

### 3. Rate Limiting
```
Geral: 100 requisições por IP / 15 minutos
Contato: 10 requisições por IP / 1 hora
```

### 4. Validação de Dados
```javascript
✓ Email: RFC 5322 compliant
✓ Telefone: Formato brasileiro
✓ Placa: Padrão ABCD-1234
✓ Comprimento máximo: name(100), message(1000)
```

### 5. Prevenção de XSS
```javascript
✓ Sanitização de HTML
✓ Escape de caracteres especiais
✓ Detecção de padrões suspeitos
✓ Content Security Policy
```

---

## 📊 Recomendações para Produção

### Crítica
1. **HTTPS/SSL**
   ```bash
   # Usando Let's Encrypt (gratuito)
   certbot certonly --webroot -w /var/www/seu-dominio -d seu-dominio.com
   ```

2. **Banco de Dados Seguro**
   - Usar variáveis de ambiente para credenciais
   - Conexão criptografada
   - Backup automático

3. **Monitoramento**
   - Implementar logging centralizado
   - Alertas de tentativas de ataque
   - Análise de logs

### Importante
1. **WAF (Web Application Firewall)**
   - Cloudflare
   - AWS WAF
   - Azure WAF

2. **Atualizações**
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

3. **Testes de Segurança**
   - Penetration testing
   - Análise de vulnerabilidades
   - Testes de carga

### Complementar
1. **Backup**
   - Backup diário do código
   - Backup de banco de dados
   - Recuperação em caso de desastre

2. **Documentação**
   - Política de Privacidade (LGPD)
   - Termos de Serviço
   - Política de Cookies

---

## 🧪 Testando a Segurança

### Teste de Headers
```bash
curl -i http://localhost:3000
```

Procure por:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### Teste de Rate Limiting
```bash
# Fazer 101 requisições rápidas
for i in {1..101}; do curl http://localhost:3000 & done
```

### Teste de CORS
```bash
curl -H "Origin: http://atacante.com" http://localhost:3000
```

### Teste de Validação
```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "ab", "email": "invalido", "message": ""}'
```

---

## 📚 Documentação Adicional

- [SEGURANCA.md](SEGURANCA.md) - Detalhes completos de segurança
- [server.js](server.js) - Código do servidor com comentários
- [security.js](security.js) - Módulo de segurança frontend
- [.htaccess](.htaccess) - Configuração Apache
- [nginx.conf](nginx.conf) - Configuração Nginx

---

## 🔗 Recursos Úteis

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Docs](https://helmetjs.github.io/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 🐛 Relatar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, **NÃO** divulgue publicamente.

Entre em contato com: `seu-email-seguranca@exemplo.com`

---

## 📄 Licença

MIT License - Veja LICENSE para mais detalhes

---

## 👨‍💻 Desenvolvido por

**Erivan Estacionamento**

🌊 Bertioga - SP - Brasil

📞 WhatsApp: (13) 99927-8944

---

**Status de Segurança:** ✅ IMPLEMENTADO E ATIVO

**Última Atualização:** 22 de junho de 2026

---

> 🔒 Este projeto prioriza segurança em todas as camadas da aplicação.
> Mantenha-se sempre atualizado com as melhores práticas de segurança web!
