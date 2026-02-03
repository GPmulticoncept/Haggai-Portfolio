(() => {
    'use strict';
    
    const $ = (sel, scope = document) => scope.querySelector(sel);
    const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
    
    // Mobile Navigation Controller
    const navToggle = $('#navToggle');
    const navLinks = $('#navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isOpen);
            navLinks.classList.toggle('is-open');
            document.body.style.overflow = isOpen ? '' : 'hidden';
            
            // Close all dropdowns when closing mobile menu
            if (isOpen) {
                $$('.dropdown-menu').forEach(menu => menu.classList.remove('is-open'));
                $$('.dropdown-toggle').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
            }
        });
    }
    
    // Dropdown Menu Controller (Desktop & Mobile)
    $$('.nav-dropdown').forEach(dropdown => {
        const toggle = $('.dropdown-toggle', dropdown);
        const menu = $('.dropdown-menu', dropdown);
        
        // Desktop: Hover
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                menu.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                menu.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Mobile: Click
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isOpen = menu.classList.contains('is-open');
                // Close other dropdowns
                $$('.dropdown-menu').forEach(m => m.classList.remove('is-open'));
                $$('.dropdown-toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
                
                // Toggle current
                menu.classList.toggle('is-open', !isOpen);
                toggle.setAttribute('aria-expanded', !isOpen);
            }
        });
    });
    
    // Smooth Scroll & Active Nav
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = $(href);
            if (!target) return;
            e.preventDefault();
            
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            
            // Update active nav
            $$('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            if (navLinks.classList.contains('is-open')) {
                navToggle.click();
            }
        });
    });
    
    // Counter Animation
    const counters = $$('.stat-value');
    if (counters.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => {
                        const target = parseFloat(counter.dataset.count);
                        const duration = 2000; const start = performance.now();
                        const animate = (currentTime) => {
                            const elapsed = currentTime - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const easeOut = 1 - Math.pow(1 - progress, 3);
                            const current = (target * easeOut).toFixed(1);
                            counter.textContent = current % 1 === 0 ? parseInt(current) : current;
                            if (progress < 1) requestAnimationFrame(animate);
                            else counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
                        };
                        requestAnimationFrame(animate);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => observer.observe(counter));
    }
    
    // Form Validation & Submission
    const form = $('#projectForm');
    const submitBtn = $('#submitBtn');
    const status = $('#formStatus');
    if (form) {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const required = $$('input[required], select[required], textarea[required]', form);
            let valid = true;
            required.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('invalid'); valid = false;
                } else {
                    field.classList.remove('invalid'); field.classList.add('valid');
                }
            });
            if (!valid) {
                status.textContent = 'Please fill in all required fields correctly.';
                status.className = 'form-status error';
                return;
            }
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                form.reset(); required.forEach(f => f.classList.remove('valid'));
                status.textContent = 'Thank you! Your inquiry has been sent successfully.';
                status.className = 'form-status success';
                setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 5000);
            } catch {
                status.textContent = 'Something went wrong. Please try again.';
                status.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send Project Inquiry</span>';
            }
        });
    }
    
    // Animate elements on scroll
    const animateElements = $$('.project-card, .expertise-card, .process-step, .info-card');
    if (animateElements.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${Math.random() * 0.2}s`;
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animateElements.forEach(el => observer.observe(el));
    }
    
    // Current Year & Navbar Scroll
    const yearSpan = $('#currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    
    let lastScrollY = window.scrollY;
    const nav = $('.glass-nav');
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        nav.classList.toggle('is-scrolled', currentScrollY > 50);
        lastScrollY = currentScrollY;
    });
    
    // Resize handler for mobile/desktop transitions
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Close mobile menu
            navLinks.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            
            // Reset dropdowns
            $$('.dropdown-menu').forEach(menu => menu.classList.remove('is-open'));
            $$('.dropdown-toggle').forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
        }
    });
})();
