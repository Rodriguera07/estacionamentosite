// ========================================
// ERIVAN ESTACIONAMENTO - PREMIUM JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMobileMenu();
    initializeGallery();
    initializeScrollAnimations();
    initializeBackToTop();
    initializeActiveNavLink();
    initializeChatWidget();
});

// ========================================
// NAVIGATION
// ========================================
function initializeNavigation() {
    const header = document.getElementById('header');
    
    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// ========================================
// MOBILE MENU
// ========================================
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// ACTIVE NAV LINK
// ========================================
function initializeActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// ========================================
// GALLERY
// ========================================
let currentSlide = 0;
let slideInterval;

function initializeGallery() {
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.gallery-btn.prev');
    const nextBtn = document.querySelector('.gallery-btn.next');
    const dotsContainer = document.querySelector('.gallery-dots');
    const thumbs = document.querySelectorAll('.thumb');
    
    if (slides.length === 0) return;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Navigation buttons
    prevBtn?.addEventListener('click', () => changeSlide(-1));
    nextBtn?.addEventListener('click', () => changeSlide(1));
    
    // Thumbnail clicks
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => goToSlide(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') changeSlide(-1);
        if (e.key === 'ArrowRight') changeSlide(1);
    });
    
    // Touch support
    const galleryMain = document.querySelector('.gallery-main');
    let touchStartX = 0;
    let touchEndX = 0;
    
    galleryMain?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    galleryMain?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
        }
    }
    
    // Auto slide
    startAutoSlide();
    
    // Pause on hover
    galleryMain?.addEventListener('mouseenter', stopAutoSlide);
    galleryMain?.addEventListener('mouseleave', startAutoSlide);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dots .dot');
    const thumbs = document.querySelectorAll('.thumb');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
    resetAutoSlide();
}

function goToSlide(index) {
    showSlide(index);
    resetAutoSlide();
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .step-card, .price-card, .contact-card, .feature-item, .about-content, .about-images, .info-card'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ========================================
// BACK TO TOP
// ========================================
function initializeBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// CHAT WIDGET FOR RESERVATIONS
// ========================================
function initializeChatWidget() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const chatBody = document.getElementById('chatBody');
    
    if (!chatWidget || !chatToggle) return;
    
    // State for the reservation form
    let reservationData = {
        nome: '',
        veiculo: '',
        placa: '',
        data: '',
        horario: '',
        observacoes: ''
    };
    
    let currentStep = 0;
    
    const steps = [
        {
            field: 'nome',
            question: 'Ola! Bem-vindo ao Erivan Estacionamento! Vou te ajudar a fazer sua reserva. Qual e o seu <strong>nome completo</strong>?',
            validation: (value) => value.length >= 3,
            errorMessage: 'Por favor, digite seu nome completo (minimo 3 caracteres).'
        },
        {
            field: 'veiculo',
            question: 'Otimo, {nome}! Agora me diz qual e o <strong>modelo e cor do seu veiculo</strong>? (Ex: Civic Preto, Onix Branco)',
            validation: (value) => value.length >= 3,
            errorMessage: 'Por favor, informe o modelo e cor do veiculo.'
        },
        {
            field: 'placa',
            question: 'Perfeito! Qual e a <strong>placa do veiculo</strong>?',
            validation: (value) => value.length >= 7,
            errorMessage: 'Por favor, informe uma placa valida.'
        },
        {
            field: 'data',
            question: 'Excelente! Para qual <strong>data</strong> voce gostaria de reservar? (Ex: 25/12/2024 ou amanha)',
            validation: (value) => value.length >= 4,
            errorMessage: 'Por favor, informe a data desejada.'
        },
        {
            field: 'observacoes',
            question: 'Alguma <strong>observacao ou pedido especial</strong>? (Se nao tiver, digite "nao")',
            validation: () => true,
            errorMessage: ''
        }
    ];
    
    // Toggle chat
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.add('active');
        chatToggle.classList.add('hidden');
        const notification = chatToggle.querySelector('.chat-notification');
        if (notification) notification.style.display = 'none';
        
        setTimeout(() => {
            chatInput.focus();
        }, 300);
    });
    
    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
        chatToggle.classList.remove('hidden');
    });
    
    // Handle send
    const handleSend = () => {
        const value = chatInput.value.trim();
        if (!value) return;
        
        // Add user message
        addMessage(value, 'user');
        chatInput.value = '';
        
        // Process the response
        processUserInput(value);
    };
    
    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
    
    function addMessage(text, type, isHtml = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const p = document.createElement('p');
        if (isHtml) {
            p.innerHTML = text;
        } else {
            p.textContent = text;
        }
        
        contentDiv.appendChild(p);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    function processUserInput(value) {
        const step = steps[currentStep];
        
        // Validate input
        if (!step.validation(value)) {
            setTimeout(() => {
                addMessage(step.errorMessage, 'bot', true);
            }, 500);
            return;
        }
        
        // Store the value
        reservationData[step.field] = value;
        currentStep++;
        
        // Check if we have more steps
        if (currentStep < steps.length) {
            setTimeout(() => {
                let question = steps[currentStep].question;
                // Replace placeholders
                question = question.replace('{nome}', reservationData.nome.split(' ')[0]);
                addMessage(question, 'bot', true);
            }, 700);
        } else {
            // All done, show summary
            setTimeout(() => {
                showReservationSummary();
            }, 700);
        }
    }
    
    function showReservationSummary() {
        const obs = reservationData.observacoes.toLowerCase() === 'nao' || reservationData.observacoes.toLowerCase() === 'não' 
            ? 'Nenhuma' 
            : reservationData.observacoes;
        
        const summaryHtml = `
            Perfeito! Aqui esta o resumo da sua reserva:
            </p>
            <div class="reservation-summary">
                <h5><i class="fas fa-clipboard-check"></i> Resumo da Reserva</h5>
                <div class="summary-item">
                    <span class="summary-label">Nome:</span>
                    <span class="summary-value">${reservationData.nome}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Veiculo:</span>
                    <span class="summary-value">${reservationData.veiculo}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Placa:</span>
                    <span class="summary-value">${reservationData.placa.toUpperCase()}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Data:</span>
                    <span class="summary-value">${reservationData.data}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Observacoes:</span>
                    <span class="summary-value">${obs}</span>
                </div>
                <a href="${generateWhatsAppLink()}" target="_blank" class="chat-whatsapp-btn">
                    <i class="fab fa-whatsapp"></i>
                    Enviar pelo WhatsApp
                </a>
            </div>
            <p style="margin-top: 0.75rem; font-size: 0.8125rem; color: var(--color-gray-500);">
                Clique no botao acima para enviar sua reserva pelo WhatsApp!
        `;
        
        addMessage(summaryHtml, 'bot', true);
        
        // Disable input after completion
        chatInput.placeholder = 'Reserva concluida! Use o botao do WhatsApp acima.';
        chatInput.disabled = true;
        chatSend.disabled = true;
        chatSend.style.opacity = '0.5';
        
        // Add restart option after a delay
        setTimeout(() => {
            addMessage('Deseja fazer outra reserva? <button onclick="restartChat()" style="background: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-top: 0.5rem; font-family: inherit;">Nova Reserva</button>', 'bot', true);
        }, 1500);
    }
    
    function generateWhatsAppLink() {
        const obs = reservationData.observacoes.toLowerCase() === 'nao' || reservationData.observacoes.toLowerCase() === 'não' 
            ? 'Nenhuma' 
            : reservationData.observacoes;
        
        const message = `Ola! Gostaria de fazer uma reserva:

*Nome:* ${reservationData.nome}
*Veiculo:* ${reservationData.veiculo}
*Placa:* ${reservationData.placa.toUpperCase()}
*Data:* ${reservationData.data}
*Observacoes:* ${obs}

Aguardo confirmacao. Obrigado!`;

        return `https://wa.me/5513997278944?text=${encodeURIComponent(message)}`;
    }
    
    // Make restart function global
    window.restartChat = function() {
        reservationData = {
            nome: '',
            veiculo: '',
            placa: '',
            data: '',
            horario: '',
            observacoes: ''
        };
        currentStep = 0;
        
        // Clear messages
        chatMessages.innerHTML = '';
        
        // Re-enable input
        chatInput.disabled = false;
        chatInput.placeholder = 'Digite sua resposta...';
        chatSend.disabled = false;
        chatSend.style.opacity = '1';
        
        // Add initial message
        addMessage(steps[0].question, 'bot', true);
        chatInput.focus();
    };
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Reduce motion for users who prefer it
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
}
