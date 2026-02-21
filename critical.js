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
        const isMatch = href === '#' + activeId ||
          href === '/#' + activeId ||
          (activeId === 'contact' && (href === '/start-project' || href === '/start-project.html'));
        link.classList.toggle('is-active', isMatch);
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

      // Auto-close mobile menu when resizing back to desktop
      var mql = window.matchMedia('(min-width: 901px)');
      function closeOnDesktop(e) {
        if (e.matches && burger.classList.contains('open')) {
          burger.classList.remove('open');
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Open menu');
          document.body.style.overflow = '';
        }
      }
      mql.addEventListener('change', closeOnDesktop);
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

          // Signal process section to disable pin during nav scroll
          window.__1012.navScrolling = true;
          var pt = window.__1012.procTrigger;
          if (pt) { pt.disable(false); }

          var top = target.getBoundingClientRect().top + window.scrollY - 80;
          var onDone = function () {
            window.__1012.navScrolling = false;
            if (pt) { pt.enable(false); }
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          };
          if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
            gsap.to(window, { scrollTo: top, duration: 0.45, ease: 'power2.out', onComplete: onDone });
          } else {
            window.scrollTo({ top: top, behavior: 'smooth' });
            // Approximate end of native smooth scroll
            setTimeout(onDone, 600);
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
    const agreeInput = document.getElementById('cf-agree');

    const nameError  = document.getElementById('cf-name-error');
    const emailError = document.getElementById('cf-email-error');
    const msgError   = document.getElementById('cf-message-error');
    const agreeError = document.getElementById('cf-agree-error');

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
      [nameError, emailError, msgError, agreeError].forEach(el => { if (el) el.textContent = ''; });
      if (agreeInput) agreeInput.classList.remove('is-error');
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

    // Agreement checkbox listener
    if (agreeInput) {
      agreeInput.addEventListener('change', function () {
        agreeInput.classList.remove('is-error');
        if (agreeError) agreeError.textContent = '';
        updateSubmitState();
      });
    }

    // Submit button disabled state
    function updateSubmitState() {
      var allFilled = nameInput.value.trim() &&
        emailInput.value.trim() &&
        msgInput.value.trim() &&
        (!agreeInput || agreeInput.checked);
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

      // Validate agreement checkbox
      if (agreeInput && !agreeInput.checked) {
        agreeInput.classList.add('is-error');
        if (agreeError) agreeError.textContent = 'Please accept the service agreement.';
        if (!firstInvalid) firstInvalid = agreeInput;
        valid = false;
      }

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
     4b. Custom Dropdowns (.cdrop)
  ------------------------------------------------ */
  function initCustomDropdowns() {
    var drops = document.querySelectorAll('.cdrop[data-for]');
    if (!drops.length) return;

    drops.forEach(function (drop) {
      var selectId = drop.getAttribute('data-for');
      var nativeSelect = document.getElementById(selectId);
      if (!nativeSelect) return;

      var trigger = drop.querySelector('.cdrop__trigger');
      var panel = drop.querySelector('.cdrop__panel');
      var labelEl = drop.querySelector('.cdrop__label');
      var iconEl = drop.querySelector('.cdrop__trigger-icon');
      var options = drop.querySelectorAll('.cdrop__option');
      var placeholder = labelEl ? labelEl.textContent : '';
      var focusedIdx = -1;

      function open() {
        drop.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        // Highlight the currently selected option
        var curVal = nativeSelect.value;
        options.forEach(function (opt, i) {
          var match = opt.getAttribute('data-value') === curVal;
          opt.classList.toggle('is-focused', match);
          if (match) focusedIdx = i;
        });
        // Ensure panel is visible for scrollIntoView
        if (focusedIdx > -1 && options[focusedIdx]) {
          options[focusedIdx].scrollIntoView({ block: 'nearest' });
        }
      }

      function close() {
        drop.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        focusedIdx = -1;
        clearFocus();
      }

      function clearFocus() {
        options.forEach(function (o) { o.classList.remove('is-focused'); });
      }

      function focusOption(idx) {
        if (idx < 0) idx = options.length - 1;
        if (idx >= options.length) idx = 0;
        clearFocus();
        focusedIdx = idx;
        options[idx].classList.add('is-focused');
        options[idx].scrollIntoView({ block: 'nearest' });
      }

      function selectOption(opt) {
        var val = opt.getAttribute('data-value');
        var text = opt.querySelector('.cdrop__opt-label').textContent;
        var optIcon = opt.querySelector('.cdrop__opt-icon');

        // Update native select
        nativeSelect.value = val;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Update trigger label
        if (labelEl) {
          labelEl.textContent = text;
          labelEl.classList.remove('cdrop__placeholder');
        }

        // Update trigger icon (copy from option if exists)
        if (iconEl && optIcon) {
          iconEl.innerHTML = optIcon.innerHTML;
          drop.classList.add('has-value');
        }

        // Mark selected
        options.forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');

        // Clear error state
        drop.classList.remove('is-error');

        close();
        trigger.focus();
      }

      // Toggle on click
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        if (drop.classList.contains('is-open')) {
          close();
        } else {
          // Close all other dropdowns first
          document.querySelectorAll('.cdrop.is-open').forEach(function (d) {
            if (d !== drop) {
              d.classList.remove('is-open');
              d.querySelector('.cdrop__trigger').setAttribute('aria-expanded', 'false');
            }
          });
          open();
        }
      });

      // Option click
      options.forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          selectOption(opt);
        });
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', function (e) {
        var key = e.key;
        var isOpen = drop.classList.contains('is-open');

        if (key === 'Escape') {
          close();
          return;
        }

        if (!isOpen && (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp')) {
          e.preventDefault();
          open();
          if (focusedIdx < 0) focusOption(0);
          return;
        }

        if (isOpen) {
          if (key === 'ArrowDown') {
            e.preventDefault();
            focusOption(focusedIdx + 1);
          } else if (key === 'ArrowUp') {
            e.preventDefault();
            focusOption(focusedIdx - 1);
          } else if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            if (focusedIdx >= 0 && options[focusedIdx]) {
              selectOption(options[focusedIdx]);
            }
          } else if (key === 'Tab') {
            close();
          }
        }
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!drop.contains(e.target)) {
          close();
        }
      });

      // Sync: if native select resets (form.reset()), also reset the custom dropdown
      nativeSelect.addEventListener('_cdrop_reset', function () {
        if (labelEl) {
          labelEl.textContent = placeholder;
          labelEl.classList.add('cdrop__placeholder');
        }
        if (iconEl) {
          iconEl.innerHTML = '';
          drop.classList.remove('has-value');
        }
        options.forEach(function (o) { o.classList.remove('is-selected'); });
        drop.classList.remove('is-error');
      });

      // Store reference for external access
      drop._selectOption = selectOption;
      drop._close = close;
    });
  }

  /* ------------------------------------------------
     4c. Inquiry Form (start-project page)
  ------------------------------------------------ */
  function initInquiryForm() {
    const SUPABASE_FUNCTION_URL =
      'https://rlwduxqdfriqhpiztkpd.supabase.co/functions/v1/contact';

    const form = document.getElementById('inquiry-form');
    if (!form) return;

    const nameInput    = document.getElementById('inq-name');
    const emailInput   = document.getElementById('inq-email');
    const companyInput = document.getElementById('inq-company');
    const phoneInput   = document.getElementById('inq-phone');
    const serviceInput = document.getElementById('inq-service');
    const budgetInput  = document.getElementById('inq-budget');
    const timelineInput = document.getElementById('inq-timeline');
    const websiteInput = document.getElementById('inq-website');
    const msgInput     = document.getElementById('inq-message');
    const referralInput = document.getElementById('inq-referral');
    const agreeInput   = document.getElementById('inq-agree');
    const honeyInput   = document.getElementById('inq_honey');
    const submitBtn    = document.getElementById('inq-submit');
    const statusEl     = document.getElementById('inq-status');
    const captchaWrap  = document.getElementById('inq-captcha');
    const captchaBox   = document.getElementById('inq-captcha-widget');

    const nameError    = document.getElementById('inq-name-error');
    const emailError   = document.getElementById('inq-email-error');
    const serviceError = document.getElementById('inq-service-error');
    const msgError     = document.getElementById('inq-message-error');
    const agreeError   = document.getElementById('inq-agree-error');

    let captchaToken   = null;
    let turnstileReady = false;
    let widgetId       = null;
    let formStarted    = false;

    // Track first field interaction
    [nameInput, emailInput, msgInput].forEach(function (input) {
      input.addEventListener('focus', function () {
        if (!formStarted) {
          formStarted = true;
          window.__1012.track('form_start', { event_category: 'inquiry' });
        }
      }, { once: false });
    });

    function sanitize(str) {
      return str ? str.trim().replace(/<[^>]*>/g, '') : '';
    }

    function setStatus(type, text) {
      statusEl.className = 'cform__status';
      if (type) {
        statusEl.classList.add('is-' + type);
        statusEl.textContent = text;
        if (type === 'success') statusEl.focus();
      }
    }

    function syncCdropError(input, add) {
      var cdrop = input.closest ? input.closest('.cform__field') : null;
      if (cdrop) {
        var dropEl = cdrop.querySelector('.cdrop[data-for]');
        if (dropEl) dropEl.classList.toggle('is-error', add);
      }
    }

    function clearFieldErrors() {
      form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
      [nameInput, emailInput, serviceInput, msgInput].forEach(el => {
        el.setAttribute('aria-invalid', 'false');
        syncCdropError(el, false);
      });
      [nameError, emailError, serviceError, msgError, agreeError].forEach(el => { if (el) el.textContent = ''; });
      if (agreeInput) agreeInput.classList.remove('is-error');
    }

    function setFieldError(input, errorEl, msg) {
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = msg;
      syncCdropError(input, true);
    }

    function validateField(input, errorEl) {
      if (input === nameInput && !input.value.trim()) {
        setFieldError(input, errorEl, 'Please enter your name.');
        return false;
      }
      if (input === emailInput && (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) {
        setFieldError(input, errorEl, 'Please enter a valid email address.');
        return false;
      }
      if (input === serviceInput && !input.value) {
        setFieldError(input, errorEl, 'Please select a service type.');
        return false;
      }
      if (input === msgInput && !input.value.trim()) {
        setFieldError(input, errorEl, 'Please describe your project.');
        return false;
      }
      input.classList.remove('is-error');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.textContent = '';
      syncCdropError(input, false);
      return true;
    }

    var fieldMap = [
      [nameInput, nameError],
      [emailInput, emailError],
      [serviceInput, serviceError],
      [msgInput, msgError],
    ];

    fieldMap.forEach(function (pair) {
      var eventName = pair[0].tagName === 'SELECT' ? 'change' : 'blur';
      pair[0].addEventListener(eventName, function () {
        validateField(pair[0], pair[1]);
        updateSubmitState();
      });
      if (pair[0].tagName !== 'SELECT') {
        pair[0].addEventListener('input', function () {
          pair[0].classList.remove('is-error');
          pair[0].setAttribute('aria-invalid', 'false');
          if (pair[1]) pair[1].textContent = '';
          updateSubmitState();
        });
      }
    });

    // Agreement checkbox
    agreeInput.addEventListener('change', function () {
      agreeInput.classList.remove('is-error');
      if (agreeError) agreeError.textContent = '';
      updateSubmitState();
    });

    function updateSubmitState() {
      var allFilled = nameInput.value.trim() &&
        emailInput.value.trim() &&
        serviceInput.value &&
        msgInput.value.trim() &&
        agreeInput.checked;
      submitBtn.disabled = !allFilled;
      submitBtn.setAttribute('aria-disabled', String(!allFilled));
    }

    updateSubmitState();

    function loadTurnstile() {
      return new Promise((resolve) => {
        if (turnstileReady) { resolve(); return; }
        if (window.turnstile) { turnstileReady = true; resolve(); return; }
        window.__onTurnstileLoad = () => { turnstileReady = true; resolve(); };
        var s = document.createElement('script');
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

      if (!agreeInput.checked) {
        agreeInput.classList.add('is-error');
        if (agreeError) agreeError.textContent = 'Please accept the service agreement.';
        if (!firstInvalid) firstInvalid = agreeInput;
        valid = false;
      }

      if (!valid) {
        setStatus('error', 'Please fill in all required fields.');
        if (firstInvalid) {
          // If invalid field is a hidden select with custom dropdown, focus the trigger instead
          var cdropWrap = firstInvalid.closest ? firstInvalid.closest('.cform__field') : null;
          var cdropTrigger = cdropWrap ? cdropWrap.querySelector('.cdrop__trigger') : null;
          if (firstInvalid.classList.contains('cdrop-native-select') && cdropTrigger) {
            cdropTrigger.focus();
          } else {
            firstInvalid.focus();
          }
        }
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');

      const payload = {
        name: sanitize(nameInput.value),
        email: sanitize(emailInput.value),
        message: sanitize(msgInput.value),
        form_type: 'inquiry',
      };

      // Extended fields
      if (companyInput.value.trim()) payload.company = sanitize(companyInput.value);
      if (phoneInput.value.trim()) payload.phone = sanitize(phoneInput.value);
      if (serviceInput.value) payload.service = serviceInput.value;
      if (budgetInput.value) payload.budget = budgetInput.value;
      if (timelineInput.value) payload.timeline = timelineInput.value;
      if (websiteInput.value.trim()) payload.website = sanitize(websiteInput.value);
      if (referralInput.value) payload.referral = referralInput.value;

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
          setStatus('success', 'Thank you! Your inquiry has been submitted. We\'ll respond within 24 hours with a tailored scope and estimate.');
          form.reset();
          // Reset custom dropdowns
          [serviceInput, budgetInput, timelineInput, referralInput].forEach(function (sel) {
            sel.dispatchEvent(new Event('_cdrop_reset'));
          });
          captchaToken = null;
          hideCaptcha();
          updateSubmitState();

          window.__1012.track('form_submit', { event_category: 'inquiry' });
        } else {
          setStatus('error', data.error || 'Error sending inquiry. Please try again.');
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
    initCustomDropdowns();
    initInquiryForm();
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
          document.querySelectorAll('.contact-sub, .cform, .cform--inquiry, .service-row, .faq-item, .proc__step').forEach(function (el) {
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

        document.querySelectorAll('.hero-headline__line, .hero-badge, .hero-sub, .hero-actions, .hero-stats, .contact-sub, .cform, .cform--inquiry, .service-row, .faq-item').forEach(function (el) {
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
