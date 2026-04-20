// ========================================
// ERIVAN ESTACIONAMENTO - JAVASCRIPT
// ========================================

// Global variables
let currentSlideIndex = 0;
let slideInterval;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGallerySlider();
    initializeNavigation();
    initializeMobileMenu();
    initializeScrollAnimations();
});

// ========================================
// Gallery Slider
// ========================================
function initializeGallerySlider() {
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    if (slides.length === 0) return;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Show first slide
    showSlide(0);
    
    // Auto slide
    startAutoSlide();
    
    // Navigation buttons
    prevBtn?.addEventListener('click', () => changeSlide(-1));
    nextBtn?.addEventListener('click', () => changeSlide(1));
    
    // Pause on hover
    const sliderTrack = document.querySelector('.gallery-track');
    sliderTrack?.addEventListener('mouseenter', () => clearInterval(slideInterval));
    sliderTrack?.addEventListener('mouseleave', startAutoSlide);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dots .dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].classList.add('active');
        dots[index]?.classList.add('active');
        currentSlideIndex = index;
    }
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.gallery-slide');
    let newIndex = currentSlideIndex + direction;
    
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    showSlide(newIndex);
    resetAutoSlide();
}

function goToSlide(index) {
    showSlide(index);
    resetAutoSlide();
}

function startAutoSlide() {
    const slides = document.querySelectorAll('.gallery-slide');
    if (slides.length > 1) {
        slideInterval = setInterval(() => changeSlide(1), 5000);
    }
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// ========================================
// Navigation
// ========================================
function initializeNavigation() {
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu
            closeMobileMenu();
        });
    });
}

// ========================================
// Mobile Menu
// ========================================
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger?.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu?.classList.toggle('active');
        hamburger?.classList.toggle('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
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
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    navMenu?.classList.remove('active');
    hamburger?.classList.remove('active');
}

// ========================================
// Scroll Animations
// ========================================
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .step-card, .price-card, .contact-card');
    
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
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ========================================
// Keyboard Navigation
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    } else if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// ========================================
// Service Worker (PWA)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// ========================================
// Analytics Tracking (placeholder)
// ========================================
function trackEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log('Event tracked:', eventName, eventData);
}
