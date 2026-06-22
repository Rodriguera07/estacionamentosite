// ========================================
// MÓDULO DE SEGURANÇA - ERIVAN ESTACIONAMENTO
// ========================================
// Proteções contra XSS, CSRF, fraudes e outras vulnerabilidades

(function() {
    'use strict';

    // ========================================
    // 1. SANITIZAÇÃO DE HTML
    // ========================================
    const SecurityManager = {
        // Sanitizar texto para prevenir XSS
        sanitizeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Escapar caracteres especiais
        escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, (c) => map[c]);
        },

        // Validar email
        isValidEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(String(email).toLowerCase());
        },

        // Validar telefone brasileiro
        isValidPhone(phone) {
            const regex = /^(?:\(?11\)?)\s?(?:9\d{4}|\d{4})-?\d{4}$/;
            return regex.test(phone.replace(/[^\d]/g, ''));
        },

        // Validar placa de carro
        isValidPlaca(placa) {
            // Formato: ABC-1234 ou ABC1234
            const regex = /^[A-Z]{3}-?\d{4}$/;
            return regex.test(placa.toUpperCase().replace(/\s/g, ''));
        },

        // Remover caracteres perigosos
        removeUnsafeChars(text) {
            return text
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
        },

        // ========================================
        // 2. PREVENÇÃO DE CSRF
        // ========================================
        getCSRFToken() {
            let token = sessionStorage.getItem('csrf_token');
            if (!token) {
                token = this.generateToken();
                sessionStorage.setItem('csrf_token', token);
            }
            return token;
        },

        generateToken() {
            return 'token_' + Math.random().toString(36).substring(2, 15) +
                   Math.random().toString(36).substring(2, 15);
        },

        // ========================================
        // 3. PROTEÇÃO CONTRA MANIPULAÇÃO DE DADOS
        // ========================================
        validateFormData(data) {
            const errors = [];

            // Nome
            if (data.nome && data.nome.length < 3) {
                errors.push('Nome deve ter pelo menos 3 caracteres');
            }
            if (data.nome && data.nome.length > 100) {
                errors.push('Nome não pode exceder 100 caracteres');
            }

            // Email
            if (data.email && !this.isValidEmail(data.email)) {
                errors.push('Email inválido');
            }

            // Telefone
            if (data.phone && !this.isValidPhone(data.phone)) {
                errors.push('Telefone inválido');
            }

            // Mensagem
            if (data.message && data.message.length > 1000) {
                errors.push('Mensagem não pode exceder 1000 caracteres');
            }

            // Placa
            if (data.placa && !this.isValidPlaca(data.placa)) {
                errors.push('Placa inválida');
            }

            // Data
            if (data.data) {
                const selectedDate = new Date(data.data);
                const today = new Date();
                if (selectedDate < today) {
                    errors.push('Data não pode ser no passado');
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        // ========================================
        // 4. PROTEÇÃO CONTRA INJEÇÃO DE CÓDIGO
        // ========================================
        isSuspiciousInput(text) {
            const suspiciousPatterns = [
                /<script/gi,
                /javascript:/gi,
                /on\w+=/gi,
                /eval\(/gi,
                /expression\(/gi,
                /behavior:/gi,
                /\x00/g,
                /\r/g,
                /\n/g,
                /<iframe/gi,
                /<object/gi,
                /<embed/gi,
                /<link/gi,
                /<style/gi
            ];

            return suspiciousPatterns.some(pattern => pattern.test(text));
        },

        // ========================================
        // 5. RATE LIMITING NO CLIENTE
        // ========================================
        createRateLimiter(maxRequests = 5, timeWindowMs = 60000) {
            const requests = [];

            return {
                isAllowed() {
                    const now = Date.now();
                    // Remover requisições fora da janela de tempo
                    while (requests.length > 0 && requests[0] < now - timeWindowMs) {
                        requests.shift();
                    }

                    if (requests.length < maxRequests) {
                        requests.push(now);
                        return true;
                    }
                    return false;
                },

                getRemainingTime() {
                    if (requests.length === 0) return 0;
                    const now = Date.now();
                    const oldestRequest = requests[0];
                    const remaining = (oldestRequest + timeWindowMs) - now;
                    return Math.max(0, remaining);
                }
            };
        },

        // ========================================
        // 6. LOGGING SEGURO
        // ========================================
        secureLog(action, data = {}) {
            const log = {
                timestamp: new Date().toISOString(),
                action: action,
                userAgent: navigator.userAgent.substring(0, 50),
                // Nunca log dados sensíveis completos
                data: {
                    ...data,
                    // Mascara email
                    email: data.email ? data.email.substring(0, 3) + '***' : undefined,
                    // Mascara telefone
                    phone: data.phone ? '***' + data.phone.substring(data.phone.length - 4) : undefined,
                    // Mascara placa (primeira metade)
                    placa: data.placa ? '***' + data.placa.substring(data.placa.length - 4) : undefined,
                }
            };

            // Apenas log em desenvolvimento ou com permissão
            if (process.env.NODE_ENV !== 'production' || window.DEBUG_MODE) {
                console.log('[SECURITY LOG]', log);
            }

            return log;
        },

        // ========================================
        // 7. PROTEÇÃO DE SESSÃO
        // ========================================
        initializeSessionProtection() {
            // Avisar antes de sair
            window.addEventListener('beforeunload', (e) => {
                // Limpar dados sensíveis
                sessionStorage.clear();
            });

            // Limpar dados ao fechar a aba
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Limpar clipboard
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText('');
                    }
                }
            });

            // Proteção contra acesso não autorizado após inatividade
            let inactivityTimeout;
            const resetInactivity = () => {
                clearTimeout(inactivityTimeout);
                inactivityTimeout = setTimeout(() => {
                    // Após 30 minutos de inatividade
                    sessionStorage.clear();
                    console.log('Sessão expirada por inatividade');
                }, 30 * 60 * 1000);
            };

            // Resetar ao qualquer atividade
            ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, resetInactivity, true);
            });

            resetInactivity();
        },

        // ========================================
        // 8. PROTEÇÃO DE DADOS NO NAVEGADOR
        // ========================================
        secureStorage() {
            return {
                set(key, value) {
                    try {
                        // Criptografia básica (apenas ofuscação, não é verdadeira criptografia)
                        const encrypted = btoa(JSON.stringify(value));
                        sessionStorage.setItem('secure_' + key, encrypted);
                    } catch (e) {
                        console.error('Erro ao salvar dados:', e);
                    }
                },

                get(key) {
                    try {
                        const encrypted = sessionStorage.getItem('secure_' + key);
                        return encrypted ? JSON.parse(atob(encrypted)) : null;
                    } catch (e) {
                        console.error('Erro ao recuperar dados:', e);
                        return null;
                    }
                },

                remove(key) {
                    sessionStorage.removeItem('secure_' + key);
                },

                clear() {
                    const keys = Object.keys(sessionStorage);
                    keys.forEach(key => {
                        if (key.startsWith('secure_')) {
                            sessionStorage.removeItem(key);
                        }
                    });
                }
            };
        },

        // ========================================
        // 9. DETECÇÃO DE FRAUDES
        // ========================================
        detectSuspiciousActivity() {
            const fingerprint = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screenResolution: `${screen.width}x${screen.height}`,
                timestamp: Date.now()
            };

            // Verificar mudanças na fingerprint
            const stored = sessionStorage.getItem('user_fingerprint');
            if (stored) {
                const storedFingerprint = JSON.parse(stored);
                if (storedFingerprint.userAgent !== fingerprint.userAgent ||
                    storedFingerprint.timezone !== fingerprint.timezone) {
                    console.warn('Possível atividade suspeita detectada');
                    return false;
                }
            } else {
                sessionStorage.setItem('user_fingerprint', JSON.stringify(fingerprint));
            }

            return true;
        }
    };

    // ========================================
    // APLICAR PROTEÇÕES AO INICIAR
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar proteções
        SecurityManager.initializeSessionProtection();
        SecurityManager.detectSuspiciousActivity();

        // Proteger todos os formulários
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                // Adicionar token CSRF
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_csrf';
                csrfInput.value = SecurityManager.getCSRFToken();
                this.appendChild(csrfInput);
            });
        });

        // Proteger inputs de texto
        document.querySelectorAll('input[type="text"], textarea').forEach(input => {
            input.addEventListener('blur', function() {
                // Sanitizar valor
                const originalValue = this.value;
                if (SecurityManager.isSuspiciousInput(originalValue)) {
                    console.warn('Entrada suspeita detectada:', this.name);
                    this.value = SecurityManager.removeUnsafeChars(originalValue);
                }
            });
        });

        console.log('%c🔒 Sistema de Segurança Ativado', 'color: green; font-weight: bold;');
    });

    // Expor para uso global
    window.SecurityManager = SecurityManager;
})();
