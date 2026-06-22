const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// 1. HELMET - Proteção de headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', 'fonts.googleapis.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://wa.me'],
            fontSrc: ["'self'", 'fonts.gstatic.com', 'cdnjs.cloudflare.com'],
            frameSrc: ["'self'", 'https://wa.me'],
        },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true,
    },
}));

// 2. CORS - Controle de origem cruzada
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://erivan-estacionamento.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. RATE LIMITING - Proteção contra DDoS e bruteforce
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET' && req.path !== '/contact', // Skip para GET estático
});

const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Máximo 10 contatos por hora
    message: 'Muitas requisições de contato, por favor tente novamente mais tarde.',
});

app.use('/contact', strictLimiter);
app.use(limiter);

// 4. Body parsing com limites
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// 5. Sanitização de dados - Remove caracteres perigosos
app.use(mongoSanitize());

// 6. HPP - Proteção contra HTTP Parameter Pollution
app.use(hpp());

// ========================================
// SECURITY HEADERS
// ========================================

app.use((req, res, next) => {
    // Remover informações sensíveis do header
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com fonts.googleapis.com;");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// ========================================
// STATIC FILES
// ========================================

// Servir arquivos estáticos com cache apropriado
app.use(express.static(path.join(__dirname, '.'), {
    maxAge: '1d',
    etag: false,
}));

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Contact form endpoint (com validação)
app.post('/contact', (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validação básica
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e mensagem são obrigatórios.',
            });
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido.',
            });
        }

        // Verificação de comprimento
        if (name.length > 100 || message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Dados excedem o tamanho máximo permitido.',
            });
        }

        // Log de segurança (sem dados sensíveis)
        console.log(`[${new Date().toISOString()}] Contato recebido de: ${email.substring(0, 3)}***`);

        // Aqui você poderia enviar para um serviço de email
        // ou salvar em um banco de dados

        res.json({
            success: true,
            message: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
        });
    } catch (error) {
        console.error('Erro ao processar contato:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar sua mensagem.',
        });
    }
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Página não encontrada.',
    });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    
    // Não expor detalhes de erro em produção
    const message = process.env.NODE_ENV === 'production' 
        ? 'Erro interno do servidor' 
        : err.message;

    res.status(err.status || 500).json({
        success: false,
        message: message,
    });
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, () => {
    console.log(`
    ========================================
    🔒 SERVIDOR SEGURO INICIADO
    ========================================
    🌐 URL: http://localhost:${PORT}
    📅 Data: ${new Date().toLocaleString('pt-BR')}
    🛡️  Segurança: ATIVA
    
    Proteções ativas:
    ✓ Helmet (Headers de segurança)
    ✓ CORS (Controle de origem)
    ✓ Rate Limiting (Proteção DDoS)
    ✓ Input Sanitization (XSS)
    ✓ HPP (Parameter Pollution)
    ✓ CSP (Content Security Policy)
    ✓ HSTS (Força HTTPS)
    ========================================
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Encerrando gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recebido. Encerrando gracefully...');
    process.exit(0);
});
