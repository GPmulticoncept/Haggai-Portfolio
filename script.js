/**
 * GP Tech Studio — script.js
 *
 * Bugs fixed:
 * - Class selectors now match HTML (nav-dropdown, is-open)
 * - No duplicate form handler (was firing twice with embedded script)
 * - nav reference no longer called per scroll event (cached)
 * - window.lastScrollY non-standard property replaced with local let
 * - fetch form includes Accept: application/json (formsubmit.co requirement)
 * - Counter fires per-counter, not all-at-once on first observe
 * - resize handler guards against null navLinks
 */

(() => {
    'use strict';

    /* ── Tiny DOM helpers ──────────────────────────────────────── */
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    function throttle(fn, ms = 100) {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= ms) { last = now; fn(...args); }
        };
    }

    function debounce(fn, ms = 150) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    }

    /* ══════════════════════════════════════════════════════════════
       1. MOBILE NAVIGATION
    ══════════════════════════════════════════════════════════════ */
    const navToggle = $('#navToggle');
    const navLinks  = $('#navLinks');

    function closeMenu() {
        if (!navToggle || !navLinks) return;
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
        document.body.style.overflow = '';
        // Also collapse all dropdowns
        $$('.dropdown-menu').forEach(m => m.classList.remove('is-open'));
        $$('[aria-haspopup]').forEach(t => t.setAttribute('aria-expanded', 'false'));
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMenu();
            } else {
                navToggle.setAttribute('aria-expanded', 'true');
                navLinks.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }
        });

        // Close menu on Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeMenu();
        });

        // Close menu if clicking outside nav
        document.addEventListener('click', e => {
            if (!e.target.closest('.glass-nav')) closeMenu();
        });
    }

    /* ══════════════════════════════════════════════════════════════
       2. DROPDOWN MENUS
       NOTE: HTML uses class "nav-dropdown" — matches this selector.
    ══════════════════════════════════════════════════════════════ */
    $$('.nav-dropdown').forEach(dropdown => {
        const toggle = $('.dropdown-toggle', dropdown);
        const menu   = $('.dropdown-menu',   dropdown);
        if (!toggle || !menu) return;

        // Desktop: hover open/close
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

        // Mobile: click toggle (accordion)
        toggle.addEventListener('click', e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = menu.classList.contains('is-open');

                // Close all others first
                $$('.nav-dropdown').forEach(other => {
                    if (other !== dropdown) {
                        const otherMenu   = $('.dropdown-menu',   other);
                        const otherToggle = $('.dropdown-toggle', other);
                        if (otherMenu)   otherMenu.classList.remove('is-open');
                        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle this one
                menu.classList.toggle('is-open', !isOpen);
                toggle.setAttribute('aria-expanded', String(!isOpen));
            }
        });
    });

    // Close menu when a dropdown item is clicked (mobile)
    $$('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeMenu();
        });
    });

    /* ══════════════════════════════════════════════════════════════
       3. SMOOTH SCROLL (all internal anchor links)
    ══════════════════════════════════════════════════════════════ */
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            // Close mobile menu if open
            closeMenu();

            // Scroll with nav offset
            const navHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
            ) || 80;

            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
            window.scrollTo({ top, behavior: 'smooth' });

            // Update URL (no reload)
            history.replaceState(null, '', href);
        });
    });

    /* ══════════════════════════════════════════════════════════════
       4. SCROLL BEHAVIORS: nav hide/show + active link highlight
    ══════════════════════════════════════════════════════════════ */
    const nav = $('.glass-nav'); // cached — not re-queried per scroll
    let lastScrollY = window.scrollY;

    const onScroll = throttle(() => {
        const current = window.scrollY;

        // Auto-hide nav on scroll down; reveal on scroll up
        if (nav) {
            if (current > lastScrollY && current > 120) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            nav.classList.toggle('is-scrolled', current > 50);
        }

        // Highlight active nav link based on scroll position
        const sections    = $$('section[id]');
        const navLinksAll = $$('.nav-link');
        let activeSectionId = '';

        sections.forEach(section => {
            const top    = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            if (current >= top && current < bottom) {
                activeSectionId = section.id;
            }
        });

        navLinksAll.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeSectionId}`);
        });

        lastScrollY = current;
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });

    /* ══════════════════════════════════════════════════════════════
       5. COUNTER ANIMATION (.stat-value[data-count])
       FIX: each counter animates independently; won't all fire at once
    ══════════════════════════════════════════════════════════════ */
    const counters = $$('.stat-value[data-count]');

    if (counters.length && 'IntersectionObserver' in window) {
        const counterObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                counterObs.unobserve(entry.target); // fire once per counter

                const el       = entry.target;
                const target   = parseFloat(el.dataset.count);
                const isDecimal = !Number.isInteger(target);
                const duration = 1800;
                const startTime = performance.now();

                function tick(now) {
                    const elapsed  = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const value = target * eased;

                    el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);

                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = isDecimal ? target.toFixed(1) : target;
                }

                requestAnimationFrame(tick);
            });
        }, { threshold: 0.4 });

        counters.forEach(c => counterObs.observe(c));
    }

    /* ══════════════════════════════════════════════════════════════
       6. SCROLL-REVEAL ANIMATIONS
    ══════════════════════════════════════════════════════════════ */
    const animatables = $$('.project-card, .expertise-card, .process-step, .info-card, .contact-form-card');

    if (animatables.length && 'IntersectionObserver' in window) {
        // Set initial hidden state via JS only (not CSS) so print/no-JS still works
        animatables.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        });

        const revealObs = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                revealObs.unobserve(entry.target);

                // Stagger delay based on order among siblings
                const siblings = Array.from(entry.target.parentElement?.children || []);
                const index = siblings.indexOf(entry.target);
                const delay = Math.min(index * 60, 240); // max 240ms stagger

                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        animatables.forEach(el => revealObs.observe(el));
    }

    /* ══════════════════════════════════════════════════════════════
       7. CONTACT FORM — FETCH SUBMISSION
       FIX: single handler (no duplicate from embedded script)
       FIX: Accept: application/json header for formsubmit.co
    ══════════════════════════════════════════════════════════════ */
    const form      = $('#projectForm');
    const submitBtn = $('#submitBtn');
    const statusDiv = $('#formStatus');

    if (form && submitBtn && statusDiv) {
        const originalBtnHTML = submitBtn.innerHTML;

        function setStatus(msg, type) {
            statusDiv.textContent = msg;
            statusDiv.className   = `form-status ${type}`;
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        }

        form.addEventListener('submit', async e => {
            e.preventDefault();

            // Validate required fields
            const requiredFields = $$('input[required], select[required], textarea[required]', form);
            let valid = true;

            requiredFields.forEach(field => {
                const empty = !field.value.trim();
                field.classList.toggle('invalid', empty);
                field.classList.toggle('valid',   !empty);
                if (empty) valid = false;
            });

            // Extra email format check
            const emailField = $('#email', form);
            if (emailField && !isValidEmail(emailField.value)) {
                emailField.classList.add('invalid');
                valid = false;
            }

            if (!valid) {
                setStatus('Please fill in all required fields correctly.', 'error');
                // Scroll to first invalid field
                const firstInvalid = form.querySelector('.invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Loading state
            submitBtn.disabled  = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>Sending…</span>';
            statusDiv.className = 'form-status';
            statusDiv.textContent = '';

            try {
                const res = await fetch(form.action, {
                    method:  'POST',
                    body:    new FormData(form),
                    // FIX: formsubmit.co requires this to respond with JSON instead of redirecting
                    headers: { 'Accept': 'application/json' }
                });

                if (res.ok) {
                    // Redirect to custom thank-you page on success
                    window.location.href = 'thank-you.html';
                } else {
                    let errMsg = 'Server error. Please try again.';
                    try {
                        const data = await res.json();
                        if (data?.message) errMsg = data.message;
                    } catch (_) { /* ignore JSON parse failure */ }
                    throw new Error(errMsg);
                }
            } catch (err) {
                console.error('[GP Tech Studio] Form submission error:', err);
                setStatus(
                    err.message || 'Something went wrong. Try emailing us directly.',
                    'error'
                );
                submitBtn.disabled  = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
        });

        // Clear invalid state on field input
        $$('input, select, textarea', form).forEach(field => {
            field.addEventListener('input', () => {
                if (field.value.trim()) {
                    field.classList.remove('invalid');
                    field.classList.add('valid');
                }
            });
        });
    }

    /* ══════════════════════════════════════════════════════════════
       8. CURRENT YEAR IN FOOTER
    ══════════════════════════════════════════════════════════════ */
    const yearSpan = $('#currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* ══════════════════════════════════════════════════════════════
       9. RESIZE: reset mobile nav state on desktop breakpoint
    ══════════════════════════════════════════════════════════════ */
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    }, 250));

    /* ══════════════════════════════════════════════════════════════
       10. PAGE LOAD PERFORMANCE LOG (uses modern Navigation Timing API)
          FIX: replaced deprecated performance.timing
    ══════════════════════════════════════════════════════════════ */
    window.addEventListener('load', () => {
        document.body.classList.add('js-loaded');

        const [navEntry] = performance.getEntriesByType('navigation');
        if (navEntry) {
            const loadMs = Math.round(navEntry.loadEventEnd - navEntry.startTime);
            console.log(`%c⚡ GP Tech Studio — loaded in ${loadMs}ms`,
                'color:#6366f1;font-weight:bold;font-size:13px;');
        }
    });

    /* ══════════════════════════════════════════════════════════════
       11. GLOBAL ERROR BOUNDARY
    ══════════════════════════════════════════════════════════════ */
    window.addEventListener('error', e => {
        if (e.filename?.includes(window.location.hostname)) {
            console.error('[GP Tech Studio] Script error:', e.message, `@ ${e.filename}:${e.lineno}`);
        }
    });
    window.addEventListener('unhandledrejection', e => {
        console.error('[GP Tech Studio] Unhandled rejection:', e.reason);
        e.preventDefault();
    });

})();
