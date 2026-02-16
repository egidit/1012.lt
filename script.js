/* ============================================
   1012.lt v3 — Creative Reimagining Engine
   WebGL fluid, GSAP cinematic animations,
   horizontal scroll, split text, contact form
   ============================================ */

;(function () {
  'use strict';

  /* ------------------------------------------------
     Globals & helpers
  ------------------------------------------------ */
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  /* ------------------------------------------------
     Translations (PRESERVED — identical data)
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
      'hero.title': 'Svetainė, kuria klientai <span class="accent-text">pasitikės.</span>',
      'hero.sub': 'Profesionalus verslo pristatymas internete. Daugiau užklausų, aiškesnis įvaizdis ir svetainė, kurią lengva valdyti pačiam.',
      'hero.cta1': 'Gauti pasiūlymą',
      'hero.cta2': 'Mūsų paslaugos',
      'hero.m1.label': 'Įgyvendintų projektų',
      'hero.m2.label': 'Metų patirtis',
      'hero.m3.label': 'Atsakymo laikas',
      'services.label': 'Paslaugos',
      'services.title': 'Ką galime padaryti<br><span class="muted-text">jūsų verslui.</span>',
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
      'process.title': 'Kaip viskas vyksta<br><span class="muted-text">nuo pradžios iki pabaigos.</span>',
      'process.s1.title': 'Pokalbis',
      'process.s1.text': 'Susipažįstame su jūsų verslu ir tikslais. Išsiaiškinsime, ko tiksliai reikia svetainei ir kokį rezultatą norite pasiekti.',
      'process.s1.output': '→ aiškus planas',
      'process.s2.title': 'Dizainas',
      'process.s2.text': 'Paruošiame svetainės dizainą — kaip ji atrodys ir kaip ja naudosis jūsų klientai. Rodome, deriname, tvirtiname kartu.',
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
      'projects.title': 'Rezultatai, kurie<br><span class="muted-text">kalba patys už save.</span>',
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
      'contact.title': 'Pasikalbėkime.',
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
      'hero.title': 'A website your customers <span class="accent-text">will trust.</span>',
      'hero.sub': 'Professional business presence online. More inquiries, a clearer image, and a website that\'s easy to manage yourself.',
      'hero.cta1': 'Get a Quote',
      'hero.cta2': 'Our Services',
      'hero.m1.label': 'Projects completed',
      'hero.m2.label': 'Years of experience',
      'hero.m3.label': 'Response time',
      'services.label': 'Services',
      'services.title': 'What we can do<br><span class="muted-text">for your business.</span>',
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
      'process.title': 'How it all works<br><span class="muted-text">from start to finish.</span>',
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
      'projects.title': 'Results that<br><span class="muted-text">speak for themselves.</span>',
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
      'contact.title': 'Let\u2019s talk.',
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

  /* ------------------------------------------------
     1. WebGL Fluid Background (Canvas 2D fallback)
     Organic morphing gradient blobs that respond
     to mouse position and scroll velocity
  ------------------------------------------------ */
  function initFluid() {
    if (RM) return;

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

    // Blob configuration
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
        gradient.addColorStop(0, `hsla(${blob.hue}, ${blob.sat}%, ${blob.light}%, 0.15)`);
        gradient.addColorStop(0.5, `hsla(${blob.hue}, ${blob.sat}%, ${blob.light}%, 0.05)`);
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

  /*
   * FIX (Critical Issue 1 — Initial Render Glitch):
   *
   * ROOT CAUSE: The original splitTextIntoWords split el.innerHTML by
   * whitespace (html.split(/\s+/)), which fragmented HTML tags across
   * word boundaries. For elements with data-i18n-html containing markup
   * like '<span class="muted-text">jūsų verslui.</span>', the split
   * produced tokens such as 'class="muted-text">jūsų' which rendered
   * as literal text — displaying raw code fragments to the user.
   *
   * After a language switch, applyLang() replaced innerHTML with the
   * clean dictionary string, overwriting the broken splits. This is why
   * switching language and switching back "fixed" the display.
   *
   * FIX: Walk childNodes to preserve HTML element boundaries. Only
   * actual text nodes are split into word spans; element nodes (<span>,
   * <br>, etc.) are cloned intact with their children processed
   * recursively. This prevents HTML tag content from leaking into
   * visible text.
   */
  function splitTextIntoWords(el) {
    const originalText = el.textContent;
    const frag = document.createDocumentFragment();

    function processNode(node, container) {
      if (node.nodeType === 3) {
        // Text node — split by whitespace, preserve spaces as text nodes
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
          // Clone element wrapper, process children recursively
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
     0. Preloader — Logo Reveal
     - CSS animations drive the entrance (starts instantly on page load)
     - Hold while logo is fully visible
     - Smooth fade-out → content appears
     Content is hidden via .preloader-active CSS rules until
     the exit completes, preventing any flash.
  ------------------------------------------------ */
  function initPreloader(onComplete) {
    // Force scroll to top on every page refresh
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const preloader = document.getElementById('preloader');
    if (!preloader) {
      document.body.classList.remove('preloader-active');
      onComplete();
      return;
    }

    const chars = preloader.querySelectorAll('.preloader__char');
    const line = preloader.querySelector('.preloader__line');

    // Hide the accent line — not part of this animation
    if (line) line.style.display = 'none';

    // State flags
    let assetsReady = document.readyState === 'complete';
    let introComplete = false;
    let exitStarted = false;

    const SAFETY_TIMEOUT_MS = 8000;

    // Track when all assets (images, fonts, etc.) finish loading
    if (!assetsReady) {
      window.addEventListener('load', function () {
        assetsReady = true;
        tryExit();
      });
    }
    // Safety: don't wait forever for assets
    setTimeout(function () { assetsReady = true; tryExit(); }, SAFETY_TIMEOUT_MS);

    function tryExit() {
      if (assetsReady && introComplete && !exitStarted) {
        exitStarted = true;
        runExit();
      }
    }

    // --- Reduced motion fast-path ---
    if (RM) {
      chars.forEach(function (c) { c.style.animation = 'none'; c.style.transform = 'none'; c.style.opacity = '1'; });
      setTimeout(function () {
        if (preloader.parentNode) preloader.remove();
        onComplete();
        document.body.classList.remove('preloader-active');
      }, 600);
      return;
    }

    // --- INTRO ---
    // CSS @keyframes handle the character entrance automatically (starts
    // at page load, no JS dependency). We just wait for the animations
    // to finish, then hold the logo visible before exiting.
    function runIntro() {
      // Last character animation: delay 0.53s + duration 0.8s = 1.33s
      // Add a generous hold so the logo is clearly visible
      var CSS_ANIM_TOTAL_MS = 1330;
      var HOLD_MS = 800;

      setTimeout(function () {
        introComplete = true;
        tryExit();
      }, CSS_ANIM_TOTAL_MS + HOLD_MS);
    }

    // --- EXIT ANIMATION ---
    // 1) Letters slide back down (reverse of entrance)
    // 2) Black screen fades out to reveal site
    function runExit() {
      if (typeof gsap !== 'undefined') {
        // Clear CSS animations so GSAP can take full control of transforms
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

        // Phase 1 — letters slide down behind masks (reverse of entrance)
        exitTl.to(chars, {
          y: '120%',
          opacity: 0,
          duration: 0.7,
          stagger: { each: 0.06, from: 'end' },
          ease: 'power3.in',
        });

        // Reveal site content underneath BEFORE fade begins
        exitTl.call(function () {
          onComplete();
          document.body.classList.remove('preloader-active');
        });

        // Phase 2 — black background fades out to reveal site underneath
        exitTl.to(preloader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power1.inOut',
        });

      } else {
        // CSS transition fallback
        preloader.style.transition = 'opacity 0.8s ease';
        preloader.style.opacity = '0';
        setTimeout(function () {
          if (preloader.parentNode) preloader.remove();
          onComplete();
          document.body.classList.remove('preloader-active');
        }, 850);
      }
    }

    // Kick off the intro (just waits for CSS animations + hold)
    runIntro();
  }

  /* ------------------------------------------------
     3. Hero Cinematic Entrance
  ------------------------------------------------ */
  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    // Split headline into chars, grouped by words to preserve natural word-wrap
    const headline = document.querySelector('.hero-headline__line');
    if (headline) {
      let fullChars = [];
      const frag = document.createDocumentFragment();

      function splitNodeIntoWordChars(node, container) {
        if (node.nodeType === 3) {
          // Text node — split by word boundaries, keep spaces between words
          const words = node.textContent.split(/(\s+)/);
          words.forEach(segment => {
            if (!segment) return;
            if (/^\s+$/.test(segment)) {
              // Whitespace — add as plain text to allow natural line breaks
              container.appendChild(document.createTextNode(segment));
              return;
            }
            // Word — wrap in an inline-block span so it doesn't break mid-word
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
          // Element node (e.g. <span class="accent-text">)
          const wrapper = node.cloneNode(false);
          node.childNodes.forEach(child => splitNodeIntoWordChars(child, wrapper));
          container.appendChild(wrapper);
        }
      }

      Array.from(headline.childNodes).forEach(node => splitNodeIntoWordChars(node, frag));

      headline.innerHTML = '';
      headline.appendChild(frag);

      // Text is now split into .char spans (each at opacity 0).
      // Make the parent visible — individual chars control their own visibility.
      headline.style.opacity = '1';

      // Animate chars
      tl.to(fullChars, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.02,
        delay: 0.3,
      });
    }

    // Badge
    tl.to('.hero-badge', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.6');

    // Subtitle
    tl.to('.hero-sub', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.4');

    // Actions
    tl.to('.hero-actions', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.3');

    // Stats
    tl.to('.hero-stats', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, '-=0.3');
  }

  /* ------------------------------------------------
     4. Scroll-triggered Animations
  ------------------------------------------------ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Service rows — slide in from left with stagger
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

    // Section headlines — split and reveal
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

    // Section eyebrows — fade in
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

    // Project panels — rise up with parallax
    gsap.utils.toArray('.project-panel').forEach((panel, i) => {
      gsap.to(panel, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        delay: i * 0.15,
      });

      // Internal parallax on gradient
      const gradient = panel.querySelector('.project-panel__gradient');
      if (gradient) {
        gsap.fromTo(gradient, {
          scale: 1.15,
        }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    });

    // Contact headline — split chars
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
  }

  /* ------------------------------------------------
     5. Process Section — Draggable Horizontal Track
  ------------------------------------------------ */
  function initProcessDrag() {
    const track = document.querySelector('.process-track');
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      track.classList.add('is-dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      hasMoved = true;
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Prevent text selection while dragging
    track.addEventListener('selectstart', (e) => {
      if (isDown) e.preventDefault();
    });

    // Prevent click on links/elements after drag
    track.addEventListener('click', (e) => {
      if (hasMoved) e.preventDefault();
    });

    // Arrow buttons
    const prevBtn = document.querySelector('.process-nav__btn--prev');
    const nextBtn = document.querySelector('.process-nav__btn--next');
    const firstCard = track.querySelector('.process-card');
    if (!firstCard) return;

    function getScrollStep() {
      return firstCard.offsetWidth + parseFloat(getComputedStyle(track.querySelector('.process-track__inner')).gap || 0);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }
  }

  /* ------------------------------------------------
     6. (Counters removed — values are static in HTML)
  ------------------------------------------------ */

  /* ------------------------------------------------
     7. Scroll Progress Bar
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
     8. Navigation
  ------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('.topbar');
    const burger = document.querySelector('.topbar__burger');
    const menu = document.querySelector('.mob-overlay');
    const mobileLinks = document.querySelectorAll('.mob-overlay__link, .mob-overlay__cta');
    const navLinks = document.querySelectorAll('.topbar__link');

    let lastScroll = 0;

    // Scrolled state
    window.addEventListener('scroll', throttle(() => {
      const scrollY = window.scrollY;

      nav.classList.toggle('scrolled', scrollY > 60);
      lastScroll = scrollY;

      // Active link
      const sections = ['paslaugos', 'procesas', 'projektai', 'kontaktai'];
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
      burger.addEventListener('click', () => {
        const open = burger.classList.toggle('open');
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', String(!open));
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });

      mobileLinks.forEach(link => {
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
     9. Smooth Anchor Scroll (GSAP)
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
          if (typeof gsap !== 'undefined') {
            gsap.to(window, { scrollTo: top, duration: 0.45, ease: 'power2.out' });
          } else {
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        }
      });
    });
  }

  /* ------------------------------------------------
     10. Contact form submission
         SUPABASE INTEGRATION — PRESERVED EXACTLY
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

    let captchaToken  = null;
    let turnstileReady = false;
    let widgetId       = null;

    function setStatus(type, text) {
      statusEl.className = 'cform__status';
      if (type) {
        statusEl.classList.add('is-' + type);
        statusEl.textContent = text;
      }
    }

    function clearFieldErrors() {
      form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));
    }

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
            setStatus('error', T[currentLang]['form.captcha.fail'] || 'CAPTCHA klaida. Bandykite dar kartą.');
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
      if (!nameInput.value.trim()) { nameInput.classList.add('is-error'); valid = false; }
      if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.classList.add('is-error'); valid = false;
      }
      if (!msgInput.value.trim()) { msgInput.classList.add('is-error'); valid = false; }

      if (!valid) {
        setStatus('error', T[currentLang]['form.error']);
        return;
      }

      submitBtn.classList.add('is-loading');

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: msgInput.value.trim(),
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
          captchaToken = null;
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

    [nameInput, emailInput, msgInput].forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-error');
      });
    });
  }

  /* ------------------------------------------------
     11. Language Switcher (PRESERVED)
  ------------------------------------------------ */
  function applyLang(lang) {
    const dict = T[lang];
    if (!dict) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.documentElement.lang = lang;
    if (dict['page.title']) document.title = dict['page.title'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key] != null) el.placeholder = dict[key];
    });

    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      toggle.querySelectorAll('.lang-toggle__opt').forEach(opt => {
        opt.classList.toggle('lang-toggle__opt--active', opt.getAttribute('data-lang') === lang);
      });
    });
  }

  function initLang() {
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

    /*
     * FIX (Critical Issue 1 — Initial Render Glitch):
     *
     * The old code only called applyLang when currentLang !== 'lt',
     * because the HTML already contains Lithuanian text. However, this
     * meant data-i18n-html elements were never formally processed
     * through applyLang before text-splitting animations ran. When a
     * user had 'en' stored in localStorage, the page first showed
     * Lithuanian HTML, then applyLang('en') ran, then GSAP split the
     * English text — but for 'lt' users, content was never "resolved"
     * and the raw HTML was sent directly into the broken splitter.
     *
     * Always applying the language on init ensures all i18n content is
     * properly set in the DOM before any animation code manipulates it.
     */
    applyLang(currentLang);
  }

  /* ------------------------------------------------
     12. Service Row Hover — glow tracking
  ------------------------------------------------ */
  function initServiceGlow() {
    if (isTouch || RM) return;

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
     13. Mobile Process Scroll (touch-friendly)
  ------------------------------------------------ */
  function initMobileProcessScroll() {
    // No longer needed — drag works on all devices
    return;
  }

  /* ------------------------------------------------
     BOOT
  ------------------------------------------------ */
  function init() {
    // Ensure scroll is at top on every page load
    window.scrollTo(0, 0);

    initFluid();
    initNav();
    initSmooth();
    initScrollProgress();
    initContactForm();
    initLang();
    initServiceGlow();
    initMobileProcessScroll();

    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }

      // Preloader runs first; hero content appears instantly after
      initPreloader(function () {
        // Make hero content visible immediately — no entrance animation
        document.querySelectorAll('.hero-headline__line, .hero-badge, .hero-sub, .hero-actions, .hero-stats').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        // Also make .char spans inside headline visible
        document.querySelectorAll('.hero-headline .char').forEach(function (ch) {
          ch.style.opacity = '1';
          ch.style.transform = 'none';
        });
        // Scroll-triggered animations for sections below the hero still run
        initScrollAnimations();
        initProcessDrag();
      });
    } else {
      // Fallback: no GSAP available
      initPreloader(function () {
        document.querySelectorAll('.hero-headline__line, .hero-badge, .hero-sub, .hero-actions, .hero-stats, .contact-sub, .cform, .service-row, .project-panel').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
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
