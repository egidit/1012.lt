// ── Satisfying Clicky Buttons ──
import { haptics } from '../utils/haptics.js';
import { randomRange } from '../utils/math.js';

export function initButton(containerId, variant = 'accent') {
  const container = document.getElementById(containerId);

  const btn = document.createElement('button');
  btn.className = `btn-widget btn-widget--${variant}`;
  btn.textContent = getLabel(variant);
  container.appendChild(btn);

  let clickCount = 0;

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    clickCount++;
    haptics.heavy();

    // Ripple effect from touch point
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'btn-ripple';
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    // Confetti burst every 5 clicks
    if (clickCount % 5 === 0) {
      spawnConfetti(e.clientX, e.clientY, variant);
    }

    // Update label occasionally
    if (clickCount % 3 === 0) {
      btn.textContent = getRandomLabel();
    }
  });
}

function getLabel(variant) {
  const labels = {
    accent: 'Press Me',
    pink: 'Click!',
    teal: 'Boop',
  };
  return labels[variant] || 'Press';
}

function getRandomLabel() {
  const words = ['Nice!', 'Wow', 'Again!', 'Yay', 'Pop', 'Boom', 'Click!', 'Boop', 'Tap', 'Yes!', 'Whee', 'Ping'];
  return words[Math.floor(Math.random() * words.length)];
}

function spawnConfetti(x, y, variant) {
  const colors = {
    accent: ['#7c5bf5', '#a78bfa', '#c4b5fd'],
    pink: ['#f55b9a', '#f472b6', '#fbcfe8'],
    teal: ['#5bf5c8', '#34d399', '#6ee7b7'],
  };
  const palette = colors[variant] || colors.accent;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = palette[Math.floor(Math.random() * palette.length)];
    particle.style.transform = `translate(${randomRange(-40, 40)}px, ${randomRange(-60, -10)}px)`;
    particle.style.width = randomRange(4, 8) + 'px';
    particle.style.height = randomRange(4, 8) + 'px';
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}
