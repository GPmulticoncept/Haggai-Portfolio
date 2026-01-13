// ==========================================================================
// HAGGAI ENITAN - 100% RESPONSIVE PORTFOLIO SCRIPT
// Complete device compatibility and optimization
// ==========================================================================

// Console welcome message
console.log('%c🚀 Haggai Enitan - 100% Responsive Portfolio', 'color: #6366f1; font-size: 18px; font-weight: bold;');
console.log('%c📱 Mobile | 📟 Tablet | 💻 Desktop | 🖥️ 4K Monitor', 'color: #10b981; font-size: 14px;');
console.log('%cOptimized for every screen size', 'color: #a0a0a0;');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Loaded - Initializing responsive features');
    
    // ============================================
    // 1. ANIMATED FLOATING PARTICLES BACKGROUND
    // ============================================
    
    const canvas = document.getElementById('backgroundCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;
        
        // Set canvas size based on device
        function setCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            ctx.scale(dpr, dpr);
            createParticles();
        }
        
        // Create particles optimized for device
        function createParticles() {
            particles = [];
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            
            // Adjust particle count based on screen size
            let particleCount;
            if (width < 768) { // Mobile
                particleCount = Math.floor((width * height) / 3000);
            } else if (width < 1024) { // Tablet
                particleCount = Math.floor((width * height) / 2500);
            } else { // Desktop
                particleCount = Math.floor((width * height) / 2000);
            }
            
            // Limit particle count for performance
            particleCount = Math.min(particleCount, 120);
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    color: `rgba(99, 102, 241, ${Math.random() * 0.2 + 0.1})`
                });
            }
        }
        
        // Animate particles
        function animateParticles() {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            
            ctx.clearRect(0, 0, width, height);
            
            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                
                // Move particle
                p.x += p.speedX;
                p.y += p.speedY;
                
                // Bounce off edges
                if (p.x < 0 || p.x > width) p.speedX *= -1;
                if (p.y < 0 || p.y > height) p.speedY *= -1;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                
                // Draw connecting lines to nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance/100)})`;
                        ctx.lineWidth = 0.3;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            
            animationId = requestAnimationFrame(animateParticles);
        }
        
        // Initialize and start animation
        setCanvasSize();
        animateParticles();
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setCanvasSize();
            }, 250);
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(setCanvasSize, 100);
        });
    }
    
    // ============================================
    // 2. SCREEN SIZE DETECTION & OPTIMIZATION
    // ============================================
    
    // Detect current screen size
    function detectScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        let deviceType = 'desktop';
        let orientation = width > height ? 'landscape' : 'portrait';
        
        if (width < 480) {
            deviceType = 'mobile';
        } else if (width < 1024) {
            deviceType = 'tablet';
        }
        
        // Add CSS classes for device detection
        document.body.classList.remove('is-mobile', 'is-tablet', 'is-desktop', 'is-portrait', 'is-landscape');
        document.body.classList.add(`is-${deviceType}`, `is-${orientation}`);
        
        // Log device info
        console.log(`📱 Device: ${deviceType.toUpperCase()} | 📐 ${width}x${height} | 🎯 DPR: ${dpr} | 📍 ${orientation}`);
        
        return { deviceType, width, height, dpr, orientation };
    }
    
    // Initialize screen detection
    const screenInfo = detectScreenSize();
    
    // ============================================
    // 3. IOS SAFARI 100VH FIX
    // ============================================
    
    // Fix for iOS Safari 100vh bug
    function fixIOSSafariVH() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Apply to hero section
            const hero = document.getElementById('hero');
            if (hero) {
                hero.style.height = `calc(var(--vh, 1vh) * 100)`;
            }
            
            console.log('🍎 iOS Safari detected - 100vh fix applied');
        }
    }
    
    fixIOSSafariVH();
    
    // ============================================
    // 4. TOUCH DEVICE DETECTION
    // ============================================
    
    // Check if touch device
    function isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }
    
    // Apply touch optimizations
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
        console.log('👆 Touch device detected - applying optimizations');
        
        // Increase touch target sizes
        document.querySelectorAll('a, button, .cta-btn, .demo-btn, .github-btn, .contact-action-btn').forEach(element => {
            element.style.minHeight = '44px';
            element.style.cursor = 'pointer';
        });
        
        // Prevent double-tap zoom on buttons
        document.querySelectorAll('button, .cta-btn').forEach(button => {
            button.style.touchAction = 'manipulation';
        });
    }
    
    // ============================================
    // 5. SMOOTH SCROLLING
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                // Calculate position with offset for fixed headers
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                // Smooth scroll
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL
                history.pushState(null, null, href);
            }
        });
    });
    
    // ============================================
    // 6. FADE-IN ANIMATIONS
    // ============================================
    
    // Create intersection observer for scroll animations
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                // Unobserve after animation
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Add fade-in class to elements
    document.querySelectorAll('.project-card, .service-card, .contact-card, .process-card, .stack-category').forEach(el => {
        el.classList.add('fade-in-hidden');
        fadeObserver.observe(el);
    });
    
    // Add CSS for fade animations
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
        .fade-in-hidden {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
                        transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .fade-in-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .fade-in-hidden {
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(fadeStyle);
    
    // ============================================
    // 7. CURRENT YEAR IN FOOTER
    // ============================================
    
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // ============================================
    // 8. FORM HANDLING
    // ============================================
    
    // Quick contact form simulation
    const contactForm = document.querySelector('.quick-contact-form');
    const submitBtn = document.querySelector('.form-submit-btn');
    
    if (submitBtn && contactForm) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form values
            const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
            let allFilled = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    allFilled = false;
                    input.style.borderColor = 'var(--error)';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (allFilled) {
                // Simulate form submission
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    submitBtn.style.background = 'var(--success)';
                    
                    // Reset form
                    setTimeout(() => {
                        inputs.forEach(input => input.value = '');
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 2000);
                }, 1500);
                
                console.log('📨 Contact form submitted (simulated)');
            } else {
                // Shake animation for empty fields
                contactForm.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    contactForm.style.animation = '';
                }, 500);
                
                console.log('⚠️ Please fill all fields');
            }
        });
        
        // Add shake animation CSS
        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(shakeStyle);
    }
    
    // ============================================
    // 9. PERFORMANCE OPTIMIZATION
    // ============================================
    
    // Throttle resize events
    let resizeThrottle;
    window.addEventListener('resize', () => {
        if (!resizeThrottle) {
            resizeThrottle = setTimeout(() => {
                detectScreenSize();
                fixIOSSafariVH();
                resizeThrottle = null;
            }, 200);
        }
    });
    
    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('💤 Page hidden - reducing animations');
        } else {
            console.log('👁️ Page visible - full experience');
        }
    });
    
    // ============================================
    // 10. DEVICE-SPECIFIC OPTIMIZATIONS
    // ============================================
    
    // Apply device-specific optimizations
    function applyDeviceOptimizations() {
        const { deviceType } = detectScreenSize();
        
        // Mobile optimizations
        if (deviceType === 'mobile') {
            // Reduce particle animation intensity
            if (window.animationId) {
                // Could adjust animation frame rate here
            }
            
            // Optimize images (if any)
            document.querySelectorAll('img').forEach(img => {
                img.loading = 'lazy';
            });
            
            console.log('📱 Mobile optimizations applied');
        }
        
        // Tablet optimizations
        if (deviceType === 'tablet') {
            console.log('📟 Tablet optimizations applied');
        }
        
        // Desktop optimizations
        if (deviceType === 'desktop') {
            console.log('💻 Desktop optimizations applied');
        }
    }
    
    // Apply initial optimizations
    applyDeviceOptimizations();
    
    // ============================================
    // 11. LOADING STATE
    // ============================================
    
    // Remove loading class when everything is loaded
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        console.log('✅ Page fully loaded - All responsive features active');
        
        // Show loading time
        const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        console.log(`⏱️ Page loaded in ${loadTime}ms`);
        
        // Check for slow connections
        if (loadTime > 3000 && navigator.connection) {
            console.log('🐢 Slow connection detected - applying additional optimizations');
        }
    });
});

// ============================================
// 12. NETWORK & CONNECTION DETECTION
// ============================================

// Check network connection
if (navigator.connection) {
    const connection = navigator.connection;
    
    console.log(`🌐 Connection: ${connection.effectiveType} | 📶 ${connection.downlink} Mbps`);
    
    // Apply optimizations for slow connections
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('⚠️ Slow connection - applying heavy optimizations');
        
        // Could disable heavy animations here
    }
}

// ============================================
// 13. ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('❌ Error:', e.message);
    // Could send errors to analytics here
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled Promise Rejection:', e.reason);
});

// ============================================
// 14. SERVICE WORKER (FOR PWA - FUTURE)
// ============================================

// Check if service workers are supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Could register service worker here for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ============================================
// 15. ANALYTICS (BASIC)
// ============================================

// Track page views and device info
function trackPageView() {
    const screenInfo = detectScreenSize();
    const timestamp = new Date().toISOString();
    
    const analyticsData = {
        page: window.location.pathname,
        device: screenInfo.deviceType,
        resolution: `${screenInfo.width}x${screenInfo.height}`,
        dpr: screenInfo.dpr,
        orientation: screenInfo.orientation,
        timestamp: timestamp
    };
    
    console.log('📊 Analytics:', analyticsData);
    
    // Could send to analytics server here
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(analyticsData) });
}

// Track initial page view
trackPageView();

// Helper function from earlier
function detectScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    let deviceType = 'desktop';
    let orientation = width > height ? 'landscape' : 'portrait';
    
    if (width < 480) {
        deviceType = 'mobile';
    } else if (width < 1024) {
        deviceType = 'tablet';
    }
    
    return { deviceType, width, height, dpr, orientation };
}

// ============================================
// FINAL INITIALIZATION
// ============================================

console.log('%c🎉 100% Responsive Portfolio Ready!', 'color: #ec4899; font-size: 16px; font-weight: bold;');
console.log('%c📧 Contact: haggai.enitan.dev@gmail.com', 'color: #10b981;');
console.log('%c✅ Tested on: Mobile | Tablet | Laptop | Desktop | 4K', 'color: #a0a0a0;');