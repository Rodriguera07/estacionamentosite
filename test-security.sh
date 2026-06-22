#!/bin/bash

# ========================================
# TESTE DE SEGURANÇA - ERIVAN ESTACIONAMENTO
# ========================================
# Este script testa as proteções de segurança do site

echo "=========================================="
echo "🔒 TESTE DE SEGURANÇA - ERIVAN ESTACIONAMENTO"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base
BASE_URL="http://localhost:3000"

# ========================================
# TESTE 1: Health Check
# ========================================
echo -e "${YELLOW}[1/6]${NC} Testando Health Check..."
RESPONSE=$(curl -s $BASE_URL/health)
if echo $RESPONSE | grep -q "OK"; then
    echo -e "${GREEN}✓ Servidor está online${NC}"
else
    echo -e "${RED}✗ Servidor está offline${NC}"
    exit 1
fi
echo ""

# ========================================
# TESTE 2: Security Headers
# ========================================
echo -e "${YELLOW}[2/6]${NC} Verificando Headers de Segurança..."
HEADERS=$(curl -s -I $BASE_URL | head -20)

TESTS=0
PASSED=0

# Teste Strict-Transport-Security
if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✓ HSTS está configurado${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ HSTS não está configurado${NC}"
fi
((TESTS++))

# Teste X-Frame-Options
if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✓ Proteção contra ClickJacking ativa${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Proteção contra ClickJacking inativa${NC}"
fi
((TESTS++))

# Teste X-Content-Type-Options
if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✓ Proteção contra MIME sniffing ativa${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Proteção contra MIME sniffing inativa${NC}"
fi
((TESTS++))

echo ""

# ========================================
# TESTE 3: Validação de Email
# ========================================
echo -e "${YELLOW}[3/6]${NC} Testando Validação de Email..."

# Email válido
RESPONSE=$(curl -s -X POST $BASE_URL/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(13) 99999-9999",
    "message": "Teste de validação"
  }')

if echo $RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✓ Email válido aceito${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Email válido rejeitado${NC}"
fi
((TESTS++))

# Email inválido
RESPONSE=$(curl -s -X POST $BASE_URL/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "email-invalido",
    "message": "Teste"
  }')

if echo $RESPONSE | grep -q "false"; then
    echo -e "${GREEN}✓ Email inválido rejeitado${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Email inválido foi aceito${NC}"
fi
((TESTS++))

echo ""

# ========================================
# TESTE 4: Rate Limiting
# ========================================
echo -e "${YELLOW}[4/6]${NC} Testando Rate Limiting..."
echo "Enviando 15 requisições rápidas..."

BLOCKED=0
for i in {1..15}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ $RESPONSE -eq 429 ]; then
        ((BLOCKED++))
    fi
done

if [ $BLOCKED -gt 0 ]; then
    echo -e "${GREEN}✓ Rate limiting está funcionando ($BLOCKED requisições bloqueadas)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Rate limiting pode precisar de ajustes${NC}"
fi
((TESTS++))

echo ""

# ========================================
# TESTE 5: CORS
# ========================================
echo -e "${YELLOW}[5/6]${NC} Testando CORS..."

RESPONSE=$(curl -s -I -H "Origin: http://atacante.com" $BASE_URL | grep "Access-Control")

if [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✓ CORS está configurado${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ CORS pode não estar respondendo${NC}"
fi
((TESTS++))

echo ""

# ========================================
# TESTE 6: XSS Protection
# ========================================
echo -e "${YELLOW}[6/6]${NC} Testando Proteção contra XSS..."

XSS_PAYLOAD='<script>alert("XSS")</script>'
RESPONSE=$(curl -s -X POST $BASE_URL/contact \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Teste XSS\",
    \"email\": \"teste@teste.com\",
    \"message\": \"$XSS_PAYLOAD\"
  }")

if echo $RESPONSE | grep -q "false"; then
    echo -e "${GREEN}✓ Proteção contra XSS ativa${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Payload XSS pode ter sido aceito${NC}"
fi
((TESTS++))

echo ""

# ========================================
# RESUMO
# ========================================
echo "=========================================="
echo "📊 RESULTADO DOS TESTES"
echo "=========================================="
echo "Testes Executados: $TESTS"
echo "Testes Passados: $PASSED"
FAILED=$((TESTS - PASSED))
echo "Testes Falhados: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    echo -e "${GREEN}🔒 Sistema está seguro${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Alguns testes falharam. Verifique as configurações.${NC}"
    exit 1
fi
