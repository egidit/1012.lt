/* ============================================
   1012.lt — Non-Critical JS Module
   GSAP animations, fluid canvas, service glow,
   process drag, text splitting
   Loaded with defer – enhances UX but not required
   ============================================ */

;(function () {
  'use strict';

  /* ------------------------------------------------
     Read shared utilities from critical.js
  ------------------------------------------------ */
  var shared = window.__1012 || {};
  var lerp = shared.lerp || function (a, b, t) { return a + (b - a) * t; };
  var debounce = shared.debounce || function (fn, ms) {
    var timer;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  };

  function getRM() {
    return shared.reducedMotion || false;
  }
  var isTouch = shared.isTouch || ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  /* ------------------------------------------------
     1. WebGL Fluid Background (Canvas 2D)
  ------------------------------------------------ */
  function initFluid() {
    if (getRM()) return;

    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h;
    let mouse = { x: 0.5, y: 0.5 };
    let mouseTarget = { x: 0.5, y: 0.5 };
    let scrollVelocity = 0;
    let lastScrollY = 0;
    let frame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', debounce(resize, 200));

    if (!isTouch) {
      window.addEventListener('mousemove', (e) => {
        mouseTarget.x = e.clientX / w;
        mouseTarget.y = e.clientY / h;
      }, { passive: true });
    }

    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      scrollVelocity = Math.abs(sy - lastScrollY);
      lastScrollY = sy;
    }, { passive: true });

    const blobs = [
      { x: 0.3, y: 0.3, r: 0.35, hue: 75, sat: 100, light: 50, speed: 0.0003 },
      { x: 0.7, y: 0.6, r: 0.3, hue: 200, sat: 60, light: 30, speed: 0.0005 },
      { x: 0.5, y: 0.8, r: 0.25, hue: 270, sat: 40, light: 20, speed: 0.0004 },
    ];

    function draw() {
      frame++;
      mouse.x = lerp(mouse.x, mouseTarget.x, 0.03);
      mouse.y = lerp(mouse.y, mouseTarget.y, 0.03);
      scrollVelocity *= 0.95;

      ctx.clearRect(0, 0, w, h);

      blobs.forEach((blob, i) => {
        const t = frame * blob.speed;
        const offsetX = Math.sin(t + i * 2) * 0.15;
        const offsetY = Math.cos(t + i * 1.5) * 0.1;
        const mouseInfluence = 0.05;
        const bx = (blob.x + offsetX + (mouse.x - 0.5) * mouseInfluence) * w;
        const by = (blob.y + offsetY + (mouse.y - 0.5) * mouseInfluence) * h;
        const br = blob.r * Math.min(w, h) * (1 + scrollVelocity * 0.002);

        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        gradient.addColorStop(0, 'hsla(' + blob.hue + ', ' + blob.sat + '%, ' + blob.light + '%, 0.15)');
        gradient.addColorStop(0.5, 'hsla(' + blob.hue + ', ' + blob.sat + '%, ' + blob.light + '%, 0.05)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ------------------------------------------------
     2. Text Splitting (Chars & Words)
  ------------------------------------------------ */
  function splitTextIntoChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    }

    return el.querySelectorAll('.char');
  }

  function splitTextIntoWords(el) {
    const originalText = el.textContent;
    const frag = document.createDocumentFragment();

    function processNode(node, container) {
      if (node.nodeType === 3) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            container.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            span.style.display = 'inline-block';
            span.setAttribute('aria-hidden', 'true');
            container.appendChild(span);
          }
        });
      } else if (node.nodeType === 1) {
        if (node.tagName === 'BR') {
          container.appendChild(node.cloneNode(true));
        } else {
          const clone = node.cloneNode(false);
          node.childNodes.forEach(child => processNode(child, clone));
          container.appendChild(clone);
        }
      }
    }

    el.childNodes.forEach(node => processNode(node, frag));
    el.innerHTML = '';
    el.setAttribute('aria-label', originalText);
    el.appendChild(frag);

    return el.querySelectorAll('.word');
  }

  /* ------------------------------------------------
     3. Hero Cinematic Entrance
  ------------------------------------------------ */
  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    const headline = document.querySelector('.hero-headline__line');
    if (headline) {
      let fullChars = [];
      const frag = document.createDocumentFragment();

      function splitNodeIntoWordChars(node, container) {
        if (node.nodeType === 3) {
          const words = node.textContent.split(/(\s+)/);
          words.forEach(segment => {
            if (!segment) return;
            if (/^\s+$/.test(segment)) {
              container.appendChild(document.createTextNode(segment));
              return;
            }
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            for (let i = 0; i < segment.length; i++) {
              const ch = document.createElement('span');
              ch.className = 'char';
              ch.textContent = segment[i];
              ch.style.display = 'inline-block';
              ch.style.opacity = '0';
              ch.style.transform = 'translateY(100%)';
              wordSpan.appendChild(ch);
              fullChars.push(ch);
            }
            container.appendChild(wordSpan);
          });
        } else if (node.nodeType === 1) {
          const wrapper = node.cloneNode(false);
          node.childNodes.forEach(child => splitNodeIntoWordChars(child, wrapper));
          container.appendChild(wrapper);
        }
      }

      Array.from(headline.childNodes).forEach(node => splitNodeIntoWordChars(node, frag));

      headline.innerHTML = '';
      headline.appendChild(frag);
      headline.style.opacity = '1';

      tl.to(fullChars, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.02,
        delay: 0.3,
      });
    }

    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
    tl.to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
    tl.to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
    tl.to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
  }

  /* ------------------------------------------------
     4. Scroll-triggered Animations
  ------------------------------------------------ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Service rows
    gsap.utils.toArray('.service-row').forEach((row, i) => {
      gsap.to(row, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        delay: i * 0.08,
      });
    });

    // Section headlines
    document.querySelectorAll('.section-headline').forEach(headline => {
      const words = splitTextIntoWords(headline);
      gsap.from(words, {
        opacity: 0,
        y: 40,
        rotateX: -20,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headline,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Section eyebrows
    gsap.utils.toArray('.section-eyebrow').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // FAQ items
    gsap.utils.toArray('.faq-item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.06,
        }
      );
    });

    // Contact headline
    const contactHeadline = document.querySelector('.contact-headline span');
    if (contactHeadline) {
      const chars = splitTextIntoChars(contactHeadline);
      gsap.from(chars, {
        opacity: 0,
        y: 80,
        rotateX: -40,
        duration: 1,
        stagger: 0.03,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: contactHeadline,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Contact sub and form
    gsap.to('.contact-sub', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.contact-sub',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    gsap.to('.cform', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cform',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Service page hero elements
    var svcHeroEyebrow = document.querySelector('.svc-hero__eyebrow');
    if (svcHeroEyebrow) {
      gsap.to(svcHeroEyebrow, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.1,
      });
    }

    var svcHeroHeadline = document.querySelector('.svc-hero__headline');
    if (svcHeroHeadline) {
      var svcWords = splitTextIntoWords(svcHeroHeadline);
      gsap.from(svcWords, {
        opacity: 0,
        y: 50,
        rotateX: -25,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power3.out',
        delay: 0.2,
      });
    }

    gsap.utils.toArray('.svc-hero__sub, .svc-hero__actions').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.35 + i * 0.1,
      });
    });

    // Service page CTA headline
    var svcCtaHeadline = document.querySelector('.svc-cta__headline');
    if (svcCtaHeadline) {
      var ctaWords = splitTextIntoWords(svcCtaHeadline);
      gsap.from(ctaWords, {
        opacity: 0,
        y: 40,
        rotateX: -20,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: svcCtaHeadline,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Service page fade-in sections
    gsap.utils.toArray('.svc-grid, .svc-features, .svc-pricing-details, .svc-audience, .svc-cta__sub, .svc-cta__actions, .svc-other-grid').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  /* ------------------------------------------------
     5. Process Section — Stacked card-reveal scroll
  ------------------------------------------------ */
  function initProcessSteps() {
    var steps = document.querySelectorAll('.proc__step');
    if (!steps.length) return;

    var numEl = document.querySelector('.proc__num');
    var titleEl = document.querySelector('.proc__active-title');
    var outputEl = document.querySelector('.proc__active-output');
    var fillEl = document.querySelector('.proc__progress-fill');
    var dots = document.querySelectorAll('.proc__dot');
    var section = document.querySelector('.act--process');
    var stepsContainer = document.querySelector('.proc__steps');
    var currentIndex = -1;
    var totalSteps = steps.length;
    var activeTriggers = [];   // track all ScrollTriggers we create
    var procTrigger = null;    // the pinned one (desktop only)
    var currentMode = null;    // 'mobile' | 'desktop'
    var targetIndex = 0;       // where scroll wants us to be
    var stepping = false;      // animation frame guard

    function applyStep(index) {
      // Immediately apply visuals for a single index
      currentIndex = index;

      var step = steps[index];
      if (numEl) numEl.textContent = step.getAttribute('data-step-num');
      if (titleEl) titleEl.textContent = step.getAttribute('data-step-title');
      if (outputEl) outputEl.textContent = step.getAttribute('data-step-output');
      if (fillEl) fillEl.style.width = ((index + 1) / totalSteps * 100) + '%';

      dots.forEach(function (dot, i) {
        dot.classList.toggle('proc__dot--active', i <= index);
      });

      steps.forEach(function (s, i) {
        s.classList.remove('is-active', 'is-above');
        if (i < index) {
          s.classList.add('is-above');
        } else if (i === index) {
          s.classList.add('is-active');
        }
      });
    }

    // Walk one step at a time toward targetIndex so dots never skip
    function stepToward() {
      if (currentIndex === targetIndex) { stepping = false; return; }
      var next = currentIndex + (targetIndex > currentIndex ? 1 : -1);
      applyStep(next);
      // Small delay between each intermediate step for visible transition
      if (currentIndex !== targetIndex) {
        setTimeout(function () { requestAnimationFrame(stepToward); }, 120);
      } else {
        stepping = false;
      }
    }

    function setActiveStep(index) {
      if (index === targetIndex && index === currentIndex) return;
      targetIndex = index;
      if (!stepping) {
        stepping = true;
        requestAnimationFrame(stepToward);
      }
    }

    // Instant jump (no animation) — used during teardown / init
    function setActiveStepImmediate(index) {
      targetIndex = index;
      stepping = false;
      applyStep(index);
    }

    function sizeContainer() {
      var max = 0;
      steps.forEach(function (s) {
        s.style.position = 'relative';
        s.style.transform = 'none';
        s.style.opacity = '1';
        var h = s.offsetHeight;
        if (h > max) max = h;
        s.style.position = '';
        s.style.transform = '';
        s.style.opacity = '';
      });
      if (max > 0) stepsContainer.style.minHeight = max + 'px';
    }

    // Tear down all process-related ScrollTriggers and inline styles
    function teardown() {
      activeTriggers.forEach(function (t) { t.kill(); });
      activeTriggers = [];
      procTrigger = null;
      window.__1012 = window.__1012 || {};
      window.__1012.procTrigger = null;

      // Remove pin-related inline styles GSAP may have left
      section.style.cssText = '';
      stepsContainer.style.minHeight = '';

      // Reset step classes
      currentIndex = -1;
      targetIndex = 0;
      stepping = false;
      steps.forEach(function (s) {
        s.classList.remove('is-active', 'is-above');
      });
    }

    function setupMobile() {
      if (currentMode === 'mobile') return;
      teardown();
      currentMode = 'mobile';

      setActiveStepImmediate(0);
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        steps.forEach(function (step, i) {
          var t = ScrollTrigger.create({
            trigger: step,
            start: 'top 70%',
            end: 'bottom 30%',
            onEnter: function () { setActiveStep(i); },
            onEnterBack: function () { setActiveStep(i); }
          });
          activeTriggers.push(t);
        });
      }
    }

    function setupDesktop() {
      if (currentMode === 'desktop') return;
      teardown();
      currentMode = 'desktop';

      sizeContainer();
      setActiveStepImmediate(0);

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        procTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=' + (totalSteps * 70) + '%',
          pin: true,
          pinSpacing: true,
          scrub: false,
          onUpdate: function (self) {
            if (window.__1012 && window.__1012.navScrolling) return;
            var raw = self.progress * totalSteps;
            var idx = Math.min(Math.floor(raw), totalSteps - 1);
            setActiveStep(idx);
          }
        });
        activeTriggers.push(procTrigger);

        window.__1012 = window.__1012 || {};
        window.__1012.procTrigger = procTrigger;
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var idx = Array.prototype.indexOf.call(steps, entry.target);
              if (idx !== -1) setActiveStep(idx);
            }
          });
        }, { rootMargin: '-30% 0px -30% 0px', threshold: 0.1 });
        steps.forEach(function (step) { observer.observe(step); });
      }
    }

    // Respond to breakpoint changes
    var mql = window.matchMedia('(max-width: 900px)');

    function applyMode() {
      if (mql.matches) {
        setupMobile();
      } else {
        setupDesktop();
      }
    }

    // Initial setup
    applyMode();

    // Listen for breakpoint crossing (works on resize)
    if (mql.addEventListener) {
      mql.addEventListener('change', applyMode);
    } else if (mql.addListener) {
      mql.addListener(applyMode);      // legacy Safari
    }

    // Dot click navigation
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-step'), 10);
        if (idx >= 0 && idx < totalSteps && procTrigger) {
          var targetProgress = (idx + 0.5) / totalSteps;
          var scrollTo = procTrigger.start + (procTrigger.end - procTrigger.start) * targetProgress;
          gsap.to(window, { scrollTo: scrollTo, duration: 0.8, ease: 'power2.out' });
        }
      });
    });

    // Recalculate on resize (only for desktop mode)
    window.addEventListener('resize', function () {
      if (currentMode === 'desktop') {
        sizeContainer();
        ScrollTrigger.refresh();
      }
    });
  }

  /* ------------------------------------------------
     6. Service Row Hover — glow tracking
  ------------------------------------------------ */
  function initServiceGlow() {
    if (isTouch || getRM()) return;

    document.querySelectorAll('.service-row').forEach(row => {
      row.addEventListener('mousemove', (e) => {
        const rect = row.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        row.style.setProperty('--glow-x', x + '%');
        row.style.setProperty('--glow-y', y + '%');
      }, { passive: true });
    });
  }

  /* ------------------------------------------------
     BOOT — hooks into critical.js onReady
  ------------------------------------------------ */
  function initNonCritical() {
    initFluid();
    initServiceGlow();

    if (typeof gsap !== 'undefined') {
      if (!getRM()) {
        initScrollAnimations();
      } else {
        // Force all animated elements visible
        document.querySelectorAll('.contact-sub, .cform, .service-row, .faq-item, .proc__step').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    }

    initProcessSteps();
  }

  // Wait for critical.js preloader to finish
  if (window.__1012 && window.__1012.onReady) {
    window.__1012.onReady(initNonCritical);
  } else {
    // Fallback: no critical.js loaded yet
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initNonCritical);
    } else {
      initNonCritical();
    }
  }
})();
