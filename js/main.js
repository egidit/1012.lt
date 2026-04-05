(() => {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════
     Text Scramble — Cyrillic-laced decode
     ═══════════════════════════════════════ */

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#абвгґджзклмнпрстфхцчшщіїєюя';
    }

    run(text) {
      const length = text.length;
      const queue = [];

      for (let i = 0; i < length; i++) {
        const to = text[i];
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        queue.push({ to, start, end, char: null });
      }

      let frame = 0;

      return new Promise((resolve) => {
        const tick = () => {
          let output = '';
          let done = 0;

          for (let i = 0; i < queue.length; i++) {
            const item = queue[i];

            if (frame >= item.end) {
              done++;
              output += item.to;
            } else if (frame >= item.start) {
              if (!item.char || Math.random() < 0.3) {
                item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
              }
              output += '<span class="scramble-char">' + item.char + '</span>';
            } else {
              output += '&nbsp;';
            }
          }

          this.el.innerHTML = output;

          if (done === queue.length) {
            resolve();
          } else {
            frame++;
            requestAnimationFrame(tick);
          }
        };

        tick();
      });
    }
  }

  /* ═══════════════════════════════════════
     Init: Scramble on hero lines
     ═══════════════════════════════════════ */

  function initScramble() {
    if (REDUCED_MOTION) return;

    const lines = document.querySelectorAll('.hero__line[data-text]');
    if (!lines.length) return;

    lines.forEach((line, i) => {
      const final = line.getAttribute('data-text');
      line.textContent = '';
      const scrambler = new TextScramble(line);

      setTimeout(() => {
        scrambler.run(final);
      }, 500 + i * 700);
    });
  }

  /* ═══════════════════════════════════════
     Init: Scroll reveal
     ═══════════════════════════════════════ */

  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (REDUCED_MOTION) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
  }

  /* ═══════════════════════════════════════
     Init: Glitch flash on hero (rare)
     ═══════════════════════════════════════ */

  function initGlitch() {
    if (REDUCED_MOTION) return;

    const name = document.querySelector('.hero__name');
    if (!name) return;

    function flash() {
      name.style.transform = `translate(${(Math.random() - 0.5) * 6}px, ${(Math.random() - 0.5) * 3}px) skewX(${(Math.random() - 0.5) * 2}deg)`;
      name.style.opacity = '0.88';

      setTimeout(() => {
        name.style.transform = '';
        name.style.opacity = '';
      }, 60 + Math.random() * 80);

      // Next glitch in 0.8–3 seconds
      setTimeout(flash, 800 + Math.random() * 2200);
    }

    // First glitch after 1.5–3 seconds
    setTimeout(flash, 1500 + Math.random() * 1500);
  }

  /* ═══════════════════════════════════════
     Simplex-style 2D noise (compact)
     ═══════════════════════════════════════ */

  const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const PERM = new Uint8Array(512);
  (() => {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  })();

  function noise2d(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;

    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      t0 *= t0;
      const g = GRAD[PERM[ii + PERM[jj]] & 7];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      t1 *= t1;
      const g = GRAD[PERM[ii + i1 + PERM[jj + j1]] & 7];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      t2 *= t2;
      const g = GRAD[PERM[ii + 1 + PERM[jj + 1]] & 7];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }
    return 70 * (n0 + n1 + n2); // -1 to 1
  }

  function fbm(x, y, octaves) {
    let val = 0, amp = 1, freq = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      val += noise2d(x * freq, y * freq) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return val / max;
  }

  /* ═══════════════════════════════════════
     Atmosphere — noise-field fog
     ═══════════════════════════════════════ */

  class Atmosphere {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      if (!this.ctx) return;

      // Render at very low resolution — gives natural softness
      this.scale = 6;
      this.width = 0;
      this.height = 0;
      this.bufW = 0;
      this.bufH = 0;
      this.imageData = null;

      this.tick = this.tick.bind(this);
      this.resize = this.resize.bind(this);

      window.addEventListener('resize', this.resize, { passive: true });
      this.resize();

      if (!REDUCED_MOTION) {
        requestAnimationFrame(this.tick);
      } else {
        this.draw(0);
      }
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.bufW = Math.ceil(this.width / this.scale);
      this.bufH = Math.ceil(this.height / this.scale);
      this.canvas.width = this.bufW;
      this.canvas.height = this.bufH;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.imageData = this.ctx.createImageData(this.bufW, this.bufH);
    }

    tick(time) {
      this.draw(time);
      requestAnimationFrame(this.tick);
    }

    draw(time) {
      const t = time * 0.00003; // very slow drift
      const w = this.bufW;
      const h = this.bufH;
      const data = this.imageData.data;
      const noiseScale = 0.008; // controls how large the shapes are

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x * noiseScale;
          const ny = y * noiseScale;

          // Layer 1: large slow shapes
          const n1 = fbm(nx + t, ny + t * 0.7, 4);
          // Layer 2: offset, slightly faster — creates depth
          const n2 = fbm(nx * 1.4 + 80 + t * 1.3, ny * 1.4 + 50 - t * 0.5, 3);

          // Combine: n1 is the main fog, n2 adds variation
          // Map from [-1,1] to a brightness value
          const combined = (n1 * 0.6 + n2 * 0.4);
          // Remap: -1..1 -> 0..1, then compress to very low brightness range
          const raw = (combined + 1) * 0.5; // 0..1

          // Subtle vignette — darken edges
          const uvx = x / w - 0.5;
          const uvy = y / h - 0.5;
          const vignette = 1 - Math.sqrt(uvx * uvx + uvy * uvy) * 1.1;
          const vig = Math.max(0, Math.min(1, vignette));

          // Final brightness: very subtle, range ~0-14 on top of bg(10,10,10)
          const brightness = raw * vig * 14;
          const bg = 10;

          // Slight warm shift in brighter areas
          const r = bg + brightness * 1.05;
          const g = bg + brightness * 0.98;
          const b = bg + brightness * 0.9;

          const idx = (y * w + x) * 4;
          data[idx]     = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      this.ctx.putImageData(this.imageData, 0, 0);
    }
  }

  /* ═══════════════════════════════════════
     Chromatic Aberration — mouse driven
     ═══════════════════════════════════════ */

  function initChromatic() {
    if (REDUCED_MOTION) return;

    const root = document.documentElement;
    let currentX = 0;
    let currentY = 0;
    let currentI = 0;
    let targetX = 0;
    let targetY = 0;
    let targetI = 0;
    let ticking = false;

    window.addEventListener('pointermove', (e) => {
      // Normalize to -1..1 from center
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      // Distance from center, 0..1
      const dist = Math.min(1, Math.sqrt(nx * nx + ny * ny));

      targetX = nx;
      targetY = ny;
      targetI = dist;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateCA);
      }
    }, { passive: true });

    function updateCA() {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      currentI += (targetI - currentI) * 0.08;

      root.style.setProperty('--ca-x', currentX.toFixed(3));
      root.style.setProperty('--ca-y', currentY.toFixed(3));
      root.style.setProperty('--ca-i', currentI.toFixed(3));

      // Pre-compute alpha values (calc inside rgba is unreliable)
      root.style.setProperty('--ca-a-hero-w', (currentI * 0.85).toFixed(3));
      root.style.setProperty('--ca-a-hero-c', (currentI * 0.75).toFixed(3));
      root.style.setProperty('--ca-a-sub-w', (currentI * 0.7).toFixed(3));
      root.style.setProperty('--ca-a-sub-c', (currentI * 0.6).toFixed(3));
      root.style.setProperty('--ca-a-body-w', (currentI * 0.55).toFixed(3));
      root.style.setProperty('--ca-a-body-c', (currentI * 0.45).toFixed(3));
      root.style.setProperty('--ca-a-cta-w', (currentI * 0.8).toFixed(3));
      root.style.setProperty('--ca-a-cta-c', (currentI * 0.7).toFixed(3));

      if (Math.abs(targetX - currentX) > 0.001 ||
          Math.abs(targetY - currentY) > 0.001 ||
          Math.abs(targetI - currentI) > 0.001) {
        requestAnimationFrame(updateCA);
      } else {
        ticking = false;
      }
    }
  }

  /* ═══════════════════════════════════════
     Boot
     ═══════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', () => {
    initScramble();
    initReveal();
    initGlitch();
    initChromatic();

    const atmos = document.getElementById('atmosphere');
    if (atmos) new Atmosphere(atmos);
  });
})();
