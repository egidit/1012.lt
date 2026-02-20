/* ============================================
   1012.lt — Consent & Analytics Module
   GDPR-compliant cookie consent banner + GA4
   Loaded with defer
   ============================================ */

;(function () {
  'use strict';

  var STORAGE_KEY = '1012_consent';
  var GA_ID = 'G-XXXXXXXXXX'; // Replace with actual GA4 Measurement ID

  /* ------------------------------------------------
     State
  ------------------------------------------------ */
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: analytics,
        timestamp: Date.now()
      }));
    } catch (_) {
      // localStorage unavailable
    }
  }

  /* ------------------------------------------------
     GA4 Loader
  ------------------------------------------------ */
  var ga4Loaded = false;

  function loadGA4() {
    if (ga4Loaded || GA_ID === 'G-XXXXXXXXXX') return;
    ga4Loaded = true;

    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.async = true;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=Lax;Secure'
    });

    // Signal to critical.js tracking helper
    if (window.__1012) {
      window.__1012.trackingReady = true;
    }
  }

  /* ------------------------------------------------
     Consent Banner
  ------------------------------------------------ */
  function createBanner() {
    // Don't create duplicates
    if (document.getElementById('consent-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-modal', 'false');

    banner.innerHTML =
      '<div class="consent-banner__inner">' +
        '<div class="consent-banner__text">' +
          '<p class="consent-banner__title">We value your privacy</p>' +
          '<p class="consent-banner__desc">We use analytics cookies to understand how you interact with our website, helping us improve our services. No personal data is shared with third parties for advertising.</p>' +
        '</div>' +
        '<div class="consent-banner__actions">' +
          '<button class="consent-banner__btn consent-banner__btn--accept" id="consent-accept">Accept</button>' +
          '<button class="consent-banner__btn consent-banner__btn--decline" id="consent-decline">Decline</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    // Force reflow then animate in
    banner.offsetHeight; // eslint-disable-line no-unused-expressions
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    var acceptBtn = document.getElementById('consent-accept');
    var declineBtn = document.getElementById('consent-decline');

    acceptBtn.addEventListener('click', function () {
      setConsent(true);
      loadGA4();
      hideBanner();
    });

    declineBtn.addEventListener('click', function () {
      setConsent(false);
      hideBanner();
    });

    // Focus the accept button for keyboard users
    requestAnimationFrame(function () {
      acceptBtn.focus();
    });

    // Trap Tab within banner while it's visible
    banner.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        // Treat Escape as decline
        setConsent(false);
        hideBanner();
        return;
      }

      if (e.key !== 'Tab') return;

      var focusable = banner.querySelectorAll('button');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function hideBanner() {
    var banner = document.getElementById('consent-banner');
    if (!banner) return;
    banner.classList.remove('is-visible');
    banner.classList.add('is-hiding');
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 400);
  }

  /* ------------------------------------------------
     Cookie settings (re-open banner)
  ------------------------------------------------ */
  function initCookieSettings() {
    var btn = document.getElementById('cookie-settings');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // Clear stored consent and re-show banner
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      ga4Loaded = false;
      if (window.__1012) window.__1012.trackingReady = false;
      createBanner();
    });
  }

  /* ------------------------------------------------
     Init
  ------------------------------------------------ */
  function init() {
    var consent = getConsent();

    if (consent === null) {
      // No consent stored — show banner
      // Delay slightly so it doesn't compete with page load
      setTimeout(createBanner, 1500);
    } else if (consent.analytics) {
      // User previously accepted
      loadGA4();
    }
    // If consent.analytics === false, do nothing (user declined)

    initCookieSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
