/* ============================================
   1012.lt — Engineering Precision
   Grid background, precision line,
   scroll animations, micro-interactions
   ============================================ */

;(function () {
  'use strict';

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------
     Translations
  ------------------------------------------------ */
  const T = {
    lt: {
      'nav.services': 'Paslaugos',
      'nav.process': 'Procesas',
      'nav.projects': 'Projektai',
      'nav.contact': 'Kontaktai',
      'nav.cta': 'Gauti pasiūlymą',
      'mob.cta': 'Susisiekite',
      'hero.badge': 'Priimame naujus projektus',
      'hero.t1': 'Svetainė, kuria',
      'hero.t2': 'jūsų klientai',
      'hero.t3': 'pasitikės.',
      'hero.sub': 'Profesionalus verslo pristatymas internete. Daugiau užklausų, aiškesnis įvaizdis ir svetainė, kurią lengva valdyti pačiam.',
      'hero.cta1': 'Gauti pasiūlymą',
      'hero.cta2': 'Mūsų paslaugos',
      'hero.m1.label': 'Įgyvendintų projektų',
      'hero.m2.label': 'Metų patirtis',
      'hero.m3.label': 'Atsakymo laikas',
      'services.label': 'Paslaugos',
      'services.title': 'Ką galime padaryti<br><span class="muted">jūsų verslui.</span>',
      'services.c1.label': 'svetainės',
      'services.c1.title': 'Verslo svetainės',
      'services.c1.text': 'Aiškus, profesionalus jūsų verslo pristatymas internete. Svetainė, kuri kelia pasitikėjimą ir skatina klientus kreiptis.',
      'services.c2.label': 'e-prekyba',
      'services.c2.title': 'Internetinė parduotuvė',
      'services.c2.text': 'Pradėkite pardavinėti internetu be sudėtingumo. Patogi parduotuvė su mokėjimais, užsakymų valdymu ir viskuo, ko reikia prekybai.',
      'services.c3.label': 'sprendimai',
      'services.c3.title': 'Individualūs sprendimai',
      'services.c3.text': 'Kai standartinis šablonas netinka — sukuriame sistemą, pritaikytą būtent jūsų verslo procesams ir poreikiams.',
      'services.c4.label': 'atnaujinimas',
      'services.c4.title': 'Esamos svetainės atnaujinimas',
      'services.c4.text': 'Jūsų dabartinė svetainė pasenusi ar lėta? Atnaujinsime dizainą, pagreitinsime ir pritaikysime šių dienų standartams.',
      'process.label': 'Procesas',
      'process.title': 'Kaip viskas vyksta<br><span class="muted">nuo pradžios iki pabaigos.</span>',
      'process.s1.title': 'Pokalbis',
      'process.s1.text': 'Susipažįstame su jūsų verslu ir tikslais. Išsiaiškinsime, ko tiksliai reikia svetainei ir kokį rezultatą norite pasiekti.',
      'process.s1.output': '→ aiškus planas',
      'process.s2.title': 'Dizainas',
      'process.s2.text': 'Paruošiame svetainės dizainą — kaip ji atrodys ir kaip ja naudosis jūsų klientai. Rodome, derinome, tvirtiname kartu.',
      'process.s2.output': '→ patvirtintas dizainas',
      'process.s3.title': 'Kūrimas',
      'process.s3.text': 'Sukuriame svetainę — greitą, patogią ir veikiančią visuose įrenginiuose. Jūs matote eigą ir galite komentuoti kiekviename etape.',
      'process.s3.output': '→ veikianti svetainė',
      'process.s4.title': 'Paleidimas',
      'process.s4.text': 'Patikriname viską iki smulkmenų — ar viskas veikia telefone, planšetėje, kompiuteryje. Tada paleidžiame ir jūsų svetainė pradeda dirbti.',
      'process.s4.output': '→ svetainė gyva',
      'process.s5.title': 'Priežiūra',
      'process.s5.text': 'Nepaliekame jūsų vienų. Atnaujiname, prižiūrime, padedame, kai reikia. Jūsų svetainė visada veikia sklandžiai.',
      'process.s5.output': '→ rami galva',
      'projects.label': 'Projektai',
      'projects.title': 'Rezultatai, kurie<br><span class="muted">kalba patys už save.</span>',
      'project1.tag': 'Verslo svetainė',
      'project1.title': 'NordTech Solutions',
      'project1.desc': 'Technologijų įmonei reikėjo svetainės, kuri aiškiai pristatytų paslaugas ir atvestų naujų klientų. Sukūrėme nuo nulio — su patogia kontaktų forma ir aiškia struktūra.',
      'project1.s1.val': '+180%',
      'project1.s1.label': 'Daugiau užklausų',
      'project1.s2.val': '3 sav.',
      'project1.s2.label': 'Projekto trukmė',
      'project2.tag': 'Internetinė parduotuvė',
      'project2.title': 'Gustosa Boutique',
      'project2.desc': 'Mados prekės ženklas norėjo pradėti pardavinėti internetu. Sukūrėme patogią parduotuvę, kurioje lengva rasti, pasirinkti ir nusipirkti.',
      'project2.s1.val': '+240%',
      'project2.s1.label': 'Pardavimų augimas',
      'project2.s2.val': '4.2%',
      'project2.s2.label': 'Pirkėjų dalis',
      'project3.tag': 'Paieškos platforma',
      'project3.title': 'Vilnius Property Hub',
      'project3.desc': 'Nekilnojamojo turto platforma, kurioje žmonės gali greitai rasti būstą Vilniuje. Patogi paieška, interaktyvus žemėlapis, greitai auganti auditorija.',
      'project3.s1.val': '15k+',
      'project3.s1.label': 'Lankytojų per mėnesį',
      'project3.s2.val': 'Nr. 1',
      'project3.s2.label': 'Vilniaus NT paieška',
      'contact.label': 'Kontaktai',
      'contact.title1': 'Pirmas žingsnis —',
      'contact.title2': 'paprastas pokalbis.',
      'contact.text': 'Parašykite mums — atsakysime per 24 valandas. Papasakosime, kiek kainuos, kiek užtruks ir ką tiksliai gausite. Jokių įsipareigojimų.',
      'form.name.label': 'Vardas',
      'form.name.ph': 'Jūsų vardas',
      'form.email.label': 'El. paštas',
      'form.email.ph': 'jusu@paštas.lt',
      'form.message.label': 'Žinutė',
      'form.message.ph': 'Papasakokite apie savo projektą...',
      'form.submit': 'Siųsti žinutę',
      'form.sending': 'Siunčiama...',
      'form.error': 'Prašome užpildyti visus laukus teisingai.',
      'form.success': 'Ačiū! Jūsų žinutė išsiųsta. Susisieksime artimiausiu metu.',
      'form.send.error': 'Klaida siunčiant žinutę. Bandykite dar kartą.',
      'form.net.error': 'Tinklo klaida. Patikrinkite ryšį ir bandykite dar kartą.',
      'form.captcha.required': 'Prašome patvirtinti, kad nesate robotas.',
      'form.captcha.fail': 'CAPTCHA patvirtinimas nepavyko. Bandykite dar kartą.',
      'footer.copy': '© 2026 Visos teisės saugomos.',
      'page.title': '1012.lt — Svetainės Lietuvos verslui',
    },
    en: {
      'nav.services': 'Services',
      'nav.process': 'Process',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.cta': 'Get a Quote',
      'mob.cta': 'Contact Us',
      'hero.badge': 'Accepting new projects',
      'hero.t1': 'A website your',
      'hero.t2': 'customers will',
      'hero.t3': 'trust.',
      'hero.sub': 'Professional business presence online. More inquiries, a clearer image, and a website that\'s easy to manage yourself.',
      'hero.cta1': 'Get a Quote',
      'hero.cta2': 'Our Services',
      'hero.m1.label': 'Projects completed',
      'hero.m2.label': 'Years of experience',
      'hero.m3.label': 'Response time',
      'services.label': 'Services',
      'services.title': 'What we can do<br><span class="muted">for your business.</span>',
      'services.c1.label': 'websites',
      'services.c1.title': 'Business Websites',
      'services.c1.text': 'A clear, professional presentation of your business online. A website that builds trust and encourages customers to reach out.',
      'services.c2.label': 'e-commerce',
      'services.c2.title': 'Online Store',
      'services.c2.text': 'Start selling online without complexity. A convenient store with payments, order management, and everything you need for commerce.',
      'services.c3.label': 'solutions',
      'services.c3.title': 'Custom Solutions',
      'services.c3.text': 'When a standard template doesn\'t fit — we build a system tailored specifically to your business processes and needs.',
      'services.c4.label': 'redesign',
      'services.c4.title': 'Website Redesign',
      'services.c4.text': 'Is your current website outdated or slow? We\'ll refresh the design, speed it up, and bring it to modern standards.',
      'process.label': 'Process',
      'process.title': 'How it all works<br><span class="muted">from start to finish.</span>',
      'process.s1.title': 'Conversation',
      'process.s1.text': 'We get to know your business and goals. We\'ll figure out exactly what the website needs and what result you want to achieve.',
      'process.s1.output': '→ clear plan',
      'process.s2.title': 'Design',
      'process.s2.text': 'We prepare the website design — how it will look and how your customers will use it. We show, adjust, and approve together.',
      'process.s2.output': '→ approved design',
      'process.s3.title': 'Development',
      'process.s3.text': 'We build the website — fast, convenient, and working on all devices. You see the progress and can comment at every stage.',
      'process.s3.output': '→ working website',
      'process.s4.title': 'Launch',
      'process.s4.text': 'We check everything down to the details — does it work on phone, tablet, computer. Then we launch and your website starts working.',
      'process.s4.output': '→ website live',
      'process.s5.title': 'Maintenance',
      'process.s5.text': 'We don\'t leave you alone. We update, maintain, and help when needed. Your website always runs smoothly.',
      'process.s5.output': '→ peace of mind',
      'projects.label': 'Projects',
      'projects.title': 'Results that<br><span class="muted">speak for themselves.</span>',
      'project1.tag': 'Business Website',
      'project1.title': 'NordTech Solutions',
      'project1.desc': 'A tech company needed a website that clearly presented services and brought new clients. We built from scratch — with a convenient contact form and clear structure.',
      'project1.s1.val': '+180%',
      'project1.s1.label': 'More inquiries',
      'project1.s2.val': '3 wks',
      'project1.s2.label': 'Project duration',
      'project2.tag': 'Online Store',
      'project2.title': 'Gustosa Boutique',
      'project2.desc': 'A fashion brand wanted to start selling online. We created a convenient store where it\'s easy to find, choose, and buy.',
      'project2.s1.val': '+240%',
      'project2.s1.label': 'Sales growth',
      'project2.s2.val': '4.2%',
      'project2.s2.label': 'Buyer conversion',
      'project3.tag': 'Search Platform',
      'project3.title': 'Vilnius Property Hub',
      'project3.desc': 'A real estate platform where people can quickly find housing in Vilnius. Convenient search, interactive map, rapidly growing audience.',
      'project3.s1.val': '15k+',
      'project3.s1.label': 'Monthly visitors',
      'project3.s2.val': 'Nr. 1',
      'project3.s2.label': 'Vilnius RE search',
      'contact.label': 'Contact',
      'contact.title1': 'First step —',
      'contact.title2': 'a simple conversation.',
      'contact.text': 'Write to us — we\'ll respond within 24 hours. We\'ll tell you how much it costs, how long it takes, and exactly what you\'ll get. No obligations.',
      'form.name.label': 'Name',
      'form.name.ph': 'Your name',
      'form.email.label': 'Email',
      'form.email.ph': 'your@email.com',
      'form.message.label': 'Message',
      'form.message.ph': 'Tell us about your project...',
      'form.submit': 'Send message',
      'form.sending': 'Sending...',
      'form.error': 'Please fill in all fields correctly.',
      'form.success': 'Thank you! Your message has been sent. We\'ll get in touch soon.',
      'form.send.error': 'Error sending message. Please try again.',
      'form.net.error': 'Network error. Check your connection and try again.',
      'form.captcha.required': 'Please confirm you are not a robot.',
      'form.captcha.fail': 'CAPTCHA verification failed. Please try again.',
      'footer.copy': '© 2026 All rights reserved.',
      'page.title': '1012.lt — Websites for Lithuanian Business',
    }
  };

  let currentLang = localStorage.getItem('lang') || 'lt';

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = performance.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  }

  /* ------------------------------------------------
     1. Engineering grid background
     Subtle dot grid with faint crosshair lines.
     Technical, integrated, not decorative.
  ------------------------------------------------ */
  function initGrid() {
    if (RM) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, dpr;
    let scrollY = 0;
    let targetScroll = 0;

    const GRID_SIZE = 60;
    const DOT_RADIUS = 0.6;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      scrollY = lerp(scrollY, targetScroll, 0.06);
      ctx.clearRect(0, 0, w, h);

      const offsetY = -(scrollY * 0.15) % GRID_SIZE;
      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 2;

      // Dot grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GRID_SIZE;
          const y = r * GRID_SIZE + offsetY;

          // Subtle distance-based fade from center
          const cx = w / 2;
          const cy = h / 2;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
          const fade = 1 - (dist / maxDist) * 0.6;

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(129,140,248,${0.12 * fade})`;
          ctx.fill();
        }
      }

      // Faint crosshair lines at center
      const centerX = Math.round(w / 2);
      const centerY = Math.round(h / 2);

      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, h);
      ctx.strokeStyle = 'rgba(129,140,248,0.025)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.strokeStyle = 'rgba(129,140,248,0.025)';
      ctx.lineWidth = 1;
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', throttle(() => {
      targetScroll = window.scrollY;
    }, 16), { passive: true });

    resize();
    draw();
  }

  /* ------------------------------------------------
     2. Precision line — scroll progress indicator
     Thin accent line on the left that fills as you
     scroll. Engineering measurement feel.
  ------------------------------------------------ */
  function initPrecisionLine() {
    if (RM || window.innerWidth < 768) return;

    const head = document.querySelector('.precision-line__head');
    if (!head) return;

    let current = 0;
    let target = 0;

    function update() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      current = lerp(current, target, 0.08);
      head.style.height = current + '%';
      requestAnimationFrame(update);
    }

    update();
  }

  /* ------------------------------------------------
     3. Scroll reveal (Intersection Observer)
  ------------------------------------------------ */
  function initReveal() {
    const els = document.querySelectorAll('.anim');
    if (!els.length) return;

    if (RM) { els.forEach(el => el.classList.add('show')); return; }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ------------------------------------------------
     4. Navigation
  ------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.nav__burger');
    const menu = document.querySelector('.mob-menu');
    const links = document.querySelectorAll('.mob-menu__link, .mob-menu__cta');

    // Scrolled state
    window.addEventListener('scroll', throttle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, 80), { passive: true });

    // Mobile menu
    if (burger && menu) {
      burger.addEventListener('click', () => {
        const open = burger.classList.toggle('open');
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });

      links.forEach(link => {
        link.addEventListener('click', () => {
          burger.classList.remove('open');
          menu.classList.remove('open');
          menu.setAttribute('aria-hidden', 'true');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ------------------------------------------------
     5. Smooth anchor scroll
  ------------------------------------------------ */
  function initSmooth() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ------------------------------------------------
     6. Contact form submission
        Adaptive CAPTCHA — Turnstile widget only
        appears when the server flags the IP as
        suspicious (rate-limited).
  ------------------------------------------------ */
  function initContactForm() {
    const SUPABASE_FUNCTION_URL =
      'https://rlwduxqdfriqhpiztkpd.supabase.co/functions/v1/contact';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput    = document.getElementById('cf-name');
    const emailInput   = document.getElementById('cf-email');
    const msgInput     = document.getElementById('cf-message');
    const honeyInput   = document.getElementById('_honey');
    const submitBtn    = document.getElementById('cf-submit');
    const statusEl     = document.getElementById('cf-status');
    const captchaWrap  = document.getElementById('cf-captcha');
    const captchaBox   = document.getElementById('cf-captcha-widget');

    // Adaptive CAPTCHA state
    let captchaToken  = null;   // token from Turnstile after solve
    let turnstileReady = false; // true once the Turnstile API JS is loaded
    let widgetId       = null;  // Turnstile render handle

    /* --- Status / error helpers --- */
    function setStatus(type, text) {
      statusEl.className = 'contact-form__status';
      if (type) {
        statusEl.classList.add('is-' + type);
        statusEl.textContent = text;
      }
    }
    function clearFieldErrors() {
      form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
    }

    /* --- Turnstile lazy loader --- */
    function loadTurnstile() {
      return new Promise((resolve) => {
        if (turnstileReady) { resolve(); return; }
        // Global callback invoked once the JS is parsed
        window.__onTurnstileLoad = () => { turnstileReady = true; resolve(); };
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
              + '?onload=__onTurnstileLoad&render=explicit';
        s.async = true;
        document.head.appendChild(s);
      });
    }

    /** Show the widget, wait for user to solve, then auto-resubmit. */
    async function showCaptcha(siteKey) {
      captchaWrap.hidden = false;
      captchaWrap.classList.add('is-visible');

      await loadTurnstile();

      if (widgetId !== null) {
        // Widget already rendered — just reset it
        window.turnstile.reset(widgetId);
      } else {
        widgetId = window.turnstile.render(captchaBox, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token) => {
            captchaToken = token;
            // Auto-resubmit with the fresh token
            form.requestSubmit();
          },
          'error-callback': () => {
            setStatus('error', T[currentLang]['form.captcha.fail'] || 'CAPTCHA klaida. Bandykite dar kartą.');
          },
        });
      }
    }

    function hideCaptcha() {
      captchaWrap.hidden = true;
      captchaWrap.classList.remove('is-visible');
    }

    /* --- Submit handler --- */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors();
      setStatus('', '');

      // Client-side validation
      let valid = true;
      if (!nameInput.value.trim()) { nameInput.classList.add('is-error'); valid = false; }
      if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.classList.add('is-error'); valid = false;
      }
      if (!msgInput.value.trim()) { msgInput.classList.add('is-error'); valid = false; }

      if (!valid) {
        setStatus('error', T[currentLang]['form.error']);
        return;
      }

      // Show loading state
      submitBtn.classList.add('is-loading');

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: msgInput.value.trim(),
      };

      // Honeypot (bots only)
      if (honeyInput && honeyInput.value) {
        payload._honey = honeyInput.value;
      }

      // Attach CAPTCHA token if user already solved one
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

        // ── Adaptive CAPTCHA trigger ──
        if (data.captcha_required) {
          submitBtn.classList.remove('is-loading');
          captchaToken = null; // clear stale token
          setStatus('error', T[currentLang]['form.captcha.required']
            || 'Prašome patvirtinti, kad nesate robotas.');
          showCaptcha(data.site_key);
          return;
        }

        if (res.ok && data.success) {
          setStatus('success', T[currentLang]['form.success']);
          form.reset();
          captchaToken = null;
          hideCaptcha();
        } else {
          setStatus('error', data.error || T[currentLang]['form.send.error']);
        }
      } catch (_err) {
        setStatus('error', T[currentLang]['form.net.error']);
      } finally {
        submitBtn.classList.remove('is-loading');
      }
    });

    // Remove error highlight on input
    [nameInput, emailInput, msgInput].forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-error');
      });
    });
  }

  /* ------------------------------------------------
     7. Language switcher
  ------------------------------------------------ */
  function applyLang(lang) {
    const dict = T[lang];
    if (!dict) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update html lang attribute
    document.documentElement.lang = lang;
    // Update page title
    if (dict['page.title']) document.title = dict['page.title'];

    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });

    // Update innerHTML for elements with rich content
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key] != null) el.placeholder = dict[key];
    });

    // Update toggle buttons state (both desktop and mobile)
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      toggle.querySelectorAll('.lang-toggle__opt').forEach(opt => {
        opt.classList.toggle('lang-toggle__opt--active', opt.getAttribute('data-lang') === lang);
      });
    });
  }

  function initLang() {
    // Bind both desktop and mobile toggles
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const opt = e.target.closest('.lang-toggle__opt');
        if (!opt) return;
        const lang = opt.getAttribute('data-lang');
        if (lang && lang !== currentLang) {
          applyLang(lang);
        }
      });
    });

    // Apply saved language on load (skip if default LT)
    if (currentLang !== 'lt') {
      applyLang(currentLang);
    }
  }

  /* ------------------------------------------------
     Boot
  ------------------------------------------------ */
  function init() {
    initGrid();
    initPrecisionLine();
    initReveal();
    initNav();
    initSmooth();
    initContactForm();
    initLang();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
