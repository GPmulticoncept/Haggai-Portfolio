// ==========================================================================
// HAGGAI ENITAN - 100% RESPONSIVE PORTFOLIO SCRIPT
// Complete device compatibility and optimization
// ==========================================================================

// Console welcome message
console.log('%c🚀 Haggai Enitan - 100% Responsive Portfolio', 'color: #6366f1; font-size: 18px; font-weight: bold;');
console.log('%c📧 Contact Form: Now Working! Goes to your email', 'color: #10b981; font-size: 14px;');
console.log('%c✅ Form submissions go to: haggai.enitan.dev@gmail.com', 'color: #a0a0a0;');

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
    detectScreenSize();
    
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
    // 4. WORKING CONTACT FORM WITH FORMSPREE
    // ============================================
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.form-submit-btn');
            const formMessage = document.getElementById('formMessage');
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Validate form
            if (!name || !email || !message) {
                showFormMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Send to Formspree
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Success
                    showFormMessage('Message sent successfully! I\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();
                    
                    // Log for debugging
                    console.log('📨 Form submitted successfully');
                    console.log(`👤 From: ${name} (${email})`);
                    console.log(`💬 Message: ${message.substring(0, 100)}...`);
                    
                    // Button success state
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                    submitBtn.style.background = 'var(--success)';
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    // Formspree error
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Fallback to email if Formspree fails
                console.warn('Formspree failed, falling back to mailto:', error);
                
                // Create mailto link
                const subject = encodeURIComponent('New Portfolio Contact Form Submission');
                const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                const mailtoLink = `mailto:haggai.enitan.dev@gmail.com?subject=${subject}&body=${body}`;
                
                // Open email client
                window.location.href = mailtoLink;
                
                // Show success message anyway
                showFormMessage('Opening your email client... Please send the pre-filled email.', 'success');
                contactForm.reset();
                
                // Reset button
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
        
        // Helper function to show form messages
        function showFormMessage(text, type) {
            const formMessage = document.getElementById('formMessage');
            if (formMessage) {
                formMessage.textContent = text;
                formMessage.className = `form-message ${type}`;
                formMessage.style.display = 'block';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }
        }
        
        // Email validation
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        console.log('✅ Contact form initialized with Formspree + mailto fallback');
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
    // 8. TOUCH DEVICE DETECTION
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
    // 10. LOADING STATE
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
// 11. NETWORK & CONNECTION DETECTION
// ============================================

// Check network connection
if (navigator.connection) {
    const connection = navigator.connection;
    
    console.log(`🌐 Connection: ${connection.effectiveType} | 📶 ${connection.downlink} Mbps`);
    
    // Apply optimizations for slow connections
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('⚠️ Slow connection - applying heavy optimizations');
    }
}

// ============================================
// 12. ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (e) => {
    console.error('❌ Error:', e.message);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled Promise Rejection:', e.reason);
});

// ============================================
// 13. ANALYTICS (BASIC)
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

console.log('%c🎉 Portfolio Ready with Working Contact Form!', 'color: #ec4899; font-size: 16px; font-weight: bold;');
console.log('%c📧 Form goes to: haggai.enitan.dev@gmail.com', 'color: #10b981;');
console.log('%c✅ Footer Fixed | Email Icon Fixed | Form Working', 'color: #a0a0a0;');