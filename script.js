document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio loaded successfully!');
    
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                setTimeout(updateCounter, 16);
            } else {
                counter.textContent = target;
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
    
    const contactForm = document.getElementById('projectForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                projectType: formData.get('projectType'),
                budget: formData.get('budget'),
                message: formData.get('message')
            };
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                console.log('✅ Form submitted:', data);
                
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                this.reset();
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
                
                setTimeout(() => {
                    const email = 'haggai.enitan.dev@gmail.com';
                    const subject = encodeURIComponent('Project Inquiry from Portfolio');
                    const body = encodeURIComponent(
                        `Name: ${data.name}\n` +
                        `Email: ${data.email}\n` +
                        `Project Type: ${data.projectType}\n` +
                        `Budget: ${data.budget}\n\n` +
                        `Message:\n${data.message}`
                    );
                    
                    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
                }, 200);
                
            } catch (error) {
                console.error('Form error:', error);
                
                submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error - Try Email';
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
                setTimeout(() => {
                    if (confirm('Form submission failed. Would you like to send via email instead?')) {
                        const email = 'haggai.enitan.dev@gmail.com';
                        const subject = encodeURIComponent('Project Inquiry from Portfolio');
                        const body = encodeURIComponent(
                            `Name: ${data.name}\n` +
                            `Email: ${data.email}\n` +
                            `Project Type: ${data.projectType}\n` +
                            `Budget: ${data.budget}\n\n` +
                            `Message:\n${data.message}`
                        );
                        
                        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                    }
                    
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                const headerHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const scrollPosition = window.pageYOffset + 100;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    const currentYear = document.getElementById('currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    const techIcons = document.querySelectorAll('.tech-icon');
    techIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-5px)';
            icon.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.2)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0)';
            icon.style.boxShadow = 'none';
        });
    });
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    const whisperCards = document.querySelectorAll('.project-card:first-child');
    whisperCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const badge = card.querySelector('.badge-production-ready');
            if (badge) {
                badge.style.animation = 'pulse 1.5s infinite';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const badge = card.querySelector('.badge-production-ready');
            if (badge) {
                badge.style.animation = 'none';
            }
        });
    });
    
    console.log('✅ All features initialized successfully!');
    console.log('📱 Whisper Network v1.0 + GospelSwipe Pro integrated!');
});

console.log('%c⚡ Haggai Enitan - Full-Stack Architect Portfolio', 'color: #6366f1; font-size: 18px; font-weight: bold;');
console.log('%c🚀 Production-Ready Portfolio Experience', 'color: #10b981; font-size: 14px;');
console.log('%c📱 GospelSwipe Pro - Product Ready PWA', 'color: #10b981; font-size: 14px;');
console.log('%c📧 Contact: haggai.enitan.dev@gmail.com', 'color: #a0a0a0;');