/**
 * GP Tech Studio — script.js
 *
 * Bugs fixed:
 * - Class selectors now match HTML (nav-dropdown, is-open)
 * - No duplicate form handler (was firing twice with embedded script)
 * - nav reference no longer called per scroll event (cached)
 * - window.lastScrollY non-standard property replaced with local let
 * - Form uses native POST (no fetch) — zero CORS issues on any host
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
       7. WHATSAPP LINKS + CONTACT FORM (Web3Forms)

       WHY THE FORM KEPT FAILING:
         - The HTML file was TRUNCATED — </footer></body></html> and the
           <script> tag were all missing. script.js never loaded at all.
           Every submit fell through to a native POST on "#" which GitHub
           Pages returns as 405 Not Allowed.
         - The submit button is now type="button" (not type="submit") so
           a native POST is physically impossible.
         - WhatsApp href built entirely in JS — Cloudflare cannot scrape
           and obfuscate a phone number that never appears in the HTML.
    ══════════════════════════════════════════════════════════════ */

    // ---- WhatsApp links (built in JS so Cloudflare cannot obfuscate) ----
    (function () {
        // +234 703 454 2773 without + and spaces = 2347034542773
        var num = ['234','703','454','2773'].join('');
        var msg = encodeURIComponent(
            "Hello! I found you on GP Tech Studio and I'd like to discuss a project."
        );
        var url = 'https://wa.me/' + num + '?text=' + msg;

        var waLink   = document.getElementById('waLink');
        var waFooter = document.getElementById('waFooter');
        if (waLink)   waLink.href   = url;
        if (waFooter) waFooter.href = url;
    }());

    // ---- Contact Form (Web3Forms) ----------------------------------------
    // Key: 0662fa50-b237-42c3-b6b5-eff1e5db31e4
    // Submit button is type="button" so NO native POST is ever possible.
    // Web3Forms accepts JSON with full CORS — works on any static host.
    // -------------------------------------------------------------------------
    var WEB3FORMS_KEY = '0662fa50-b237-42c3-b6b5-eff1e5db31e4';

    var form      = document.getElementById('projectForm');
    var submitBtn = document.getElementById('submitBtn');
    var statusDiv = document.getElementById('formStatus');

    if (form && submitBtn && statusDiv) {
        var originalBtnHTML = submitBtn.innerHTML;

        function setStatus(msg, type) {
            statusDiv.textContent = msg;
            statusDiv.className   = 'form-status ' + type;
        }

        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        }

        // Button click handler — NOT a form submit handler
        submitBtn.addEventListener('click', function () {

            // ── Validate ────────────────────────────────────────
            var requiredFields = form.querySelectorAll(
                'input[required], select[required], textarea[required]'
            );
            var valid = true;

            requiredFields.forEach(function (field) {
                var empty = !field.value.trim();
                field.classList.toggle('invalid', empty);
                field.classList.toggle('valid',   !empty);
                if (empty) valid = false;
            });

            var emailField = document.getElementById('femail');
            if (emailField && !isValidEmail(emailField.value.trim())) {
                emailField.classList.add('invalid');
                valid = false;
            }

            if (!valid) {
                setStatus('Please fill in all required fields correctly.', 'error');
                var firstInvalid = form.querySelector('.invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // ── Loading ─────────────────────────────────────────
            submitBtn.disabled  = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>Sending…</span>';
            statusDiv.className  = 'form-status';
            statusDiv.textContent = '';

            // ── Build payload ─────────────────────────────────
            var payload = {
                access_key:  WEB3FORMS_KEY,
                subject:     'New Project Inquiry — GP Tech Studio',
                from_name:   'GP Tech Studio Website',
                name:        (document.getElementById('name')?.value || '').trim(),
                email:       (emailField?.value || '').trim(),
                projectType: (document.getElementById('projectType')?.value || '').trim(),
                budget:      (document.getElementById('budget')?.value || '').trim(),
                message:     (document.getElementById('message')?.value || '').trim(),
                botcheck:    ''
            };

            // ── Submit via fetch to Web3Forms ─────────────────────
            fetch('https://api.web3forms.com/submit', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept':       'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.success) {
                    // Success: go to thank-you page on same host
                    var base = window.location.href.replace(/\/[^\/]*$/, '/');
                    window.location.href = base + 'thank-you.html';
                } else {
                    throw new Error(data.message || 'Submission failed.');
                }
            })
            .catch(function (err) {
                console.error('[GP Tech Studio] Form error:', err);
                setStatus(
                    err.message.includes('fetch') || err.message.includes('NetworkError')
                        ? 'Network error — check your connection and try again.'
                        : (err.message || 'Something went wrong. Please try again.'),
                    'error'
                );
                submitBtn.disabled  = false;
                submitBtn.innerHTML = originalBtnHTML;
            });
        });

        // Clear invalid state as user types
        form.querySelectorAll('input, select, textarea').forEach(function (field) {
            field.addEventListener('input', function () {
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
