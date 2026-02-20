/* ============================================
   1012.lt — Critical JS Module
   Nav, contact form, FAQ, preloader,
   scroll progress, smooth scroll
   Loaded synchronously – essential for UX
   ============================================ */

/* Scroll reset – must run before any rendering */
window.scrollTo(0, 0);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

;(function () {
  'use strict';

  /* ------------------------------------------------
     Globals & helpers (shared via window.__1012)
  ------------------------------------------------ */
  const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let RM = rmQuery.matches;
  rmQuery.addEventListener('change', function (e) { RM = e.matches; });
  const isMobile = window.innerWidth < 768;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = performance.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Expose shared utilities for non-critical.js
  window.__1012 = {
    RM: RM,
    get reducedMotion() { return RM; },
    isMobile: isMobile,
    isTouch: isTouch,
    lerp: lerp,
    clamp: clamp,
    throttle: throttle,
    debounce: debounce,
    // Callbacks non-critical.js hooks into after preloader finishes
    _onReady: [],
    onReady: function (fn) {
      if (window.__1012._ready) { fn(); }
      else { window.__1012._onReady.push(fn); }
    },
    _ready: false
  };

  /* ------------------------------------------------
     Event tracking helper (consent-gated)
     consent.js sets window.__1012.trackingReady = true
  ------------------------------------------------ */
  window.__1012.track = function (eventName, params) {
    if (typeof window.gtag === 'function' && window.__1012.trackingReady) {
      window.gtag('event', eventName, params || {});
    }
  };

  /* ------------------------------------------------
     no-js → js class swap
  ------------------------------------------------ */
  document.documentElement.classList.replace('no-js', 'js');

  /* ------------------------------------------------
     0. Preloader — Logo Reveal
  ------------------------------------------------ */
  function initPreloader(onComplete) {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const preloader = document.getElementById('preloader');
    if (!preloader) {
      document.body.classList.remove('preloader-active');
      onComplete();
      return;
    }

    // Skip on return visits
    if (localStorage.getItem('1012_visited')) {
      if (preloader.parentNode) preloader.remove();
      document.body.classList.remove('preloader-active');
      onComplete();
      return;
    }
    localStorage.setItem('1012_visited', '1');

    const chars = preloader.querySelectorAll('.preloader__char');
    const line = preloader.querySelector('.preloader__line');
    if (line) line.style.display = 'none';

    let assetsReady = document.readyState === 'complete';
    let introComplete = false;
    let exitStarted = false;
    const SAFETY_TIMEOUT_MS = 8000;

    if (!assetsReady) {
      window.addEventListener('load', function () {
        assetsReady = true;
        tryExit();
      });
    }
    setTimeout(function () { assetsReady = true; tryExit(); }, SAFETY_TIMEOUT_MS);

    function tryExit() {
      if (assetsReady && introComplete && !exitStarted) {
        exitStarted = true;
        runExit();
      }
    }

    // Reduced motion fast-path
    if (RM) {
      chars.forEach(function (c) {
        c.style.animation = 'none';
        c.style.transform = 'none';
        c.style.opacity = '1';
      });
      setTimeout(function () {
        if (preloader.parentNode) preloader.remove();
        onComplete();
        document.body.classList.remove('preloader-active');
      }, 600);
      return;
    }

    function runIntro() {
      var CSS_ANIM_TOTAL_MS = 610;
      var HOLD_MS = 300;
      setTimeout(function () {
        introComplete = true;
        tryExit();
      }, CSS_ANIM_TOTAL_MS + HOLD_MS);
    }

    function runExit() {
      if (typeof gsap !== 'undefined') {
        chars.forEach(function (c) {
          c.style.animation = 'none';
          c.style.transform = 'translateY(0)';
          c.style.opacity = '1';
        });

        var exitTl = gsap.timeline({
          onComplete: function () {
            if (preloader.parentNode) preloader.remove();
          },
        });

        exitTl.to(chars, {
          y: '120%',
          opacity: 0,
          duration: 0.35,
          stagger: { each: 0.03, from: 'end' },
          ease: 'power3.in',
        });

        exitTl.call(function () {
          onComplete();
          document.body.classList.remove('preloader-active');
        });

        exitTl.to(preloader, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.inOut',
        });
      } else {
        preloader.style.transition = 'opacity 0.8s ease';
        preloader.style.opacity = '0';
        setTimeout(function () {
          if (preloader.parentNode) preloader.remove();
          onComplete();
          document.body.classList.remove('preloader-active');
        }, 850);
      }
    }

    runIntro();
  }

  /* ------------------------------------------------
     1. Scroll Progress Bar
  ------------------------------------------------ */
  function initScrollProgress() {
    const fill = document.querySelector('.scroll-progress__fill');
    if (!fill) return;

    window.addEventListener('scroll', throttle(() => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      fill.style.width = progress + '%';
    }, 30), { passive: true });
  }

  /* ------------------------------------------------
     2. Navigation
  ------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('.topbar');
    const burger = document.querySelector('.topbar__burger');
    const menu = document.querySelector('.mob-overlay');
    const mobileLinks = document.querySelectorAll('.mob-overlay__link, .mob-overlay__cta');
    const navLinks = document.querySelectorAll('.topbar__link');

    // Scrolled state + active link
    window.addEventListener('scroll', throttle(() => {
      const scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 60);

      const sections = ['services', 'process', 'faq', 'contact'];
      let activeId = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) {
          activeId = id;
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === '#' + activeId);
      });
    }, 80), { passive: true });

    // Mobile menu
    if (burger && menu) {
      burger.setAttribute('aria-label', 'Open menu');

      burger.addEventListener('click', () => {
        const open = burger.classList.toggle('open');
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';

        if (open) {
          const firstLink = menu.querySelector('.mob-overlay__link, .mob-overlay__cta');
          if (firstLink) firstLink.focus();
        }
      });

      // Focus trap
      menu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          burger.classList.remove('open');
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Open menu');
          document.body.style.overflow = '';
          burger.focus();
          return;
        }

        if (e.key !== 'Tab') return;

        const focusable = menu.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('open');
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Open menu');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ------------------------------------------------
     3. Smooth Anchor Scroll
  ------------------------------------------------ */
  function initSmooth() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - 80;
          if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
            gsap.to(window, { scrollTo: top, duration: 0.45, ease: 'power2.out' });
          } else {
            window.scrollTo({ top: top, behavior: 'smooth' });
          }

          // Track CTA clicks
          if (id === '#contact') {
            window.__1012.track('cta_click', {
              event_category: 'navigation',
              event_label: a.textContent.trim()
            });
          }
        }
      });
    });
  }

  /* ------------------------------------------------
     4. Contact Form
  ------------------------------------------------ */
  function initContactForm() {
    const SUPABASE_FUNCTION_URL =
      'https://rlwduxqdfriqhpiztkpd.supabase.co/functions/v1/contact';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput  = document.getElementById('cf-name');
    const emailInput = document.getElementById('cf-email');
    const msgInput   = document.getElementById('cf-message');
    const honeyInput = document.getElementById('_honey');
    const submitBtn  = document.getElementById('cf-submit');
    const statusEl   = document.getElementById('cf-status');
    const captchaWrap = document.getElementById('cf-captcha');
    const captchaBox  = document.getElementById('cf-captcha-widget');

    const nameError  = document.getElementById('cf-name-error');
    const emailError = document.getElementById('cf-email-error');
    const msgError   = document.getElementById('cf-message-error');

    let captchaToken  = null;
    let turnstileReady = false;
    let widgetId       = null;
    let formStarted    = false;

    // Track first field interaction
    [nameInput, emailInput, msgInput].forEach(function (input) {
      input.addEventListener('focus', function () {
        if (!formStarted) {
          formStarted = true;
          window.__1012.track('form_start', { event_category: 'contact' });
        }
      }, { once: false });
    });

    function sanitize(str) {
      return str.trim().replace(/<[^>]*>/g, '');
    }

    function setStatus(type, text) {
      statusEl.className = 'cform__status';
      if (type) {
        statusEl.classList.add('is-' + type);
        statusEl.textContent = text;
        if (type === 'success') statusEl.focus();
      }
    }

    function clearFieldErrors() {
      form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
      [nameInput, emailInput, msgInput].forEach(el => el.setAttribute('aria-invalid', 'false'));
      [nameError, emailError, msgError].forEach(el => { if (el) el.textContent = ''; });
    }

    function setFieldError(input, errorEl, msg) {
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = msg;
    }

    function validateField(input, errorEl) {
      const val = input.value.trim();
      if (input === nameInput && !val) {
        setFieldError(input, errorEl, 'Please enter your name.');
        return false;
      }
      if (input === emailInput && (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))) {
        setFieldError(input, errorEl, 'Please enter a valid email address.');
        return false;
      }
      if (input === msgInput && !val) {
        setFieldError(input, errorEl, 'Please enter your message.');
        return false;
      }
      input.classList.remove('is-error');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.textContent = '';
      return true;
    }

    // Inline validation on blur
    var fieldMap = [
      [nameInput, nameError],
      [emailInput, emailError],
      [msgInput, msgError],
    ];

    fieldMap.forEach(function (pair) {
      pair[0].addEventListener('blur', function () {
        validateField(pair[0], pair[1]);
        updateSubmitState();
      });
      pair[0].addEventListener('input', function () {
        pair[0].classList.remove('is-error');
        pair[0].setAttribute('aria-invalid', 'false');
        if (pair[1]) pair[1].textContent = '';
        updateSubmitState();
      });
    });

    // Submit button disabled state
    function updateSubmitState() {
      var allFilled = nameInput.value.trim() &&
        emailInput.value.trim() &&
        msgInput.value.trim();
      submitBtn.disabled = !allFilled;
      submitBtn.setAttribute('aria-disabled', String(!allFilled));
    }

    // Initial state
    updateSubmitState();

    function loadTurnstile() {
      return new Promise((resolve) => {
        if (turnstileReady) { resolve(); return; }
        window.__onTurnstileLoad = () => { turnstileReady = true; resolve(); };
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
              + '?onload=__onTurnstileLoad&render=explicit';
        s.async = true;
        document.head.appendChild(s);
      });
    }

    async function showCaptcha(siteKey) {
      captchaWrap.hidden = false;
      captchaWrap.classList.add('is-visible');

      await loadTurnstile();

      if (widgetId !== null) {
        window.turnstile.reset(widgetId);
      } else {
        widgetId = window.turnstile.render(captchaBox, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token) => {
            captchaToken = token;
            form.requestSubmit();
          },
          'error-callback': () => {
            setStatus('error', 'CAPTCHA verification failed. Please try again.');
          },
        });
      }
    }

    function hideCaptcha() {
      captchaWrap.hidden = true;
      captchaWrap.classList.remove('is-visible');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();
      setStatus('', '');

      let valid = true;
      let firstInvalid = null;

      fieldMap.forEach(function (pair) {
        if (!validateField(pair[0], pair[1])) {
          if (!firstInvalid) firstInvalid = pair[0];
          valid = false;
        }
      });

      if (!valid) {
        setStatus('error', 'Please fill in all fields correctly.');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');

      const payload = {
        name: sanitize(nameInput.value),
        email: sanitize(emailInput.value),
        message: sanitize(msgInput.value),
      };

      if (honeyInput && honeyInput.value) {
        payload._honey = honeyInput.value;
      }

      if (captchaToken) {
        payload.captcha_token = captchaToken;
      }

      try {
        const res = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.captcha_required) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          submitBtn.setAttribute('aria-disabled', 'false');
          captchaToken = null;
          setStatus('error', 'Please confirm you are not a robot.');
          showCaptcha(data.site_key);
          return;
        }

        if (res.ok && data.success) {
          setStatus('success', 'Thank you! Your message has been sent. We\'ll get in touch soon.');
          form.reset();
          captchaToken = null;
          hideCaptcha();
          updateSubmitState();

          // Track successful submission
          window.__1012.track('form_submit', { event_category: 'contact' });
        } else {
          setStatus('error', data.error || 'Error sending message. Please try again.');
        }
      } catch (_err) {
        setStatus('error', 'Network error. Check your connection and try again.');
      } finally {
        submitBtn.classList.remove('is-loading');
        updateSubmitState();
      }
    });
  }

  /* ------------------------------------------------
     5. FAQ Accordion
  ------------------------------------------------ */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const trigger = item.querySelector('.faq-item__trigger');
      const body = item.querySelector('.faq-item__body');
      if (!trigger || !body) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all other items (single-open accordion)
        items.forEach(other => {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            const otherBody = other.querySelector('.faq-item__body');
            if (otherBody) otherBody.style.maxHeight = '0';
            other.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          body.style.maxHeight = '0';
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }

        // Track FAQ toggle
        var questionText = trigger.querySelector('.faq-item__question');
        window.__1012.track('faq_toggle', {
          event_category: 'faq',
          event_label: questionText ? questionText.textContent.substring(0, 60) : ''
        });
      });
    });
  }

  /* ------------------------------------------------
     6. Scroll depth tracking
  ------------------------------------------------ */
  function initScrollDepthTracking() {
    var milestones = [25, 50, 75, 100];
    var fired = {};

    window.addEventListener('scroll', throttle(function () {
      var scrollY = window.scrollY;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      var percent = Math.round((scrollY / maxScroll) * 100);

      milestones.forEach(function (m) {
        if (percent >= m && !fired[m]) {
          fired[m] = true;
          window.__1012.track('scroll_depth', {
            event_category: 'engagement',
            percent: m
          });
        }
      });
    }, 500), { passive: true });
  }

  /* ------------------------------------------------
     BOOT
  ------------------------------------------------ */
  function init() {
    window.scrollTo(0, 0);

    initNav();
    initSmooth();
    initScrollProgress();
    initContactForm();
    initFAQ();
    initScrollDepthTracking();

    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }

      initPreloader(function () {
        var mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.focus({ preventScroll: true });

        // Make hero content visible immediately
        document.querySelectorAll('.hero-headline__line, .hero-badge, .hero-sub, .hero-actions, .hero-stats').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        document.querySelectorAll('.hero-headline .char').forEach(function (ch) {
          ch.style.opacity = '1';
          ch.style.transform = 'none';
        });

        if (RM) {
          // Force all animated elements visible immediately
          document.querySelectorAll('.contact-sub, .cform, .service-row, .faq-item, .process-card, .process-card__num').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        }

        // Signal non-critical.js that we're ready
        window.__1012._ready = true;
        window.__1012._onReady.forEach(function (fn) { fn(); });
        window.__1012._onReady = [];
      });
    } else {
      // No GSAP fallback
      initPreloader(function () {
        var mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.focus({ preventScroll: true });

        document.querySelectorAll('.hero-headline__line, .hero-badge, .hero-sub, .hero-actions, .hero-stats, .contact-sub, .cform, .service-row, .faq-item').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });

        window.__1012._ready = true;
        window.__1012._onReady.forEach(function (fn) { fn(); });
        window.__1012._onReady = [];
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    if (typeof gsap === 'undefined') {
      window.addEventListener('load', init);
    } else {
      init();
    }
  }
})();
