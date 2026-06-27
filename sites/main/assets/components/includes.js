(function () {
  'use strict';

  function loadVercelAnalytics() {
    if (document.querySelector(`script[src="/_vercel/insights/script.js"]`)) return;

    globalThis.va = globalThis.va || function () { globalThis.vaq = globalThis.vaq || []; globalThis.vaq.push(arguments); };
    const vaScript = document.createElement('script');
    vaScript.defer = true;
    vaScript.src = '/_vercel/insights/script.js';
    document.head.appendChild(vaScript);

    globalThis.si = globalThis.si || function () { globalThis.siq = globalThis.siq || []; globalThis.siq.push(arguments); };
    const siScript = document.createElement('script');
    siScript.defer = true;
    siScript.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(siScript);
  }

  function localSanitizeHTML(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body;
    } catch (e) {
      console.warn('HTML parsing failed, using text fallback:', e);
      const div = document.createElement('div');
      div.textContent = html;
      return div;
    }
  }

  async function fetchPartial(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.text();
    } catch (error) {
      console.error('Error fetching partial:', url, error);
      return null;
    }
  }

  function ensureThemeColor() {
    // Fallback: <meta name="theme-color"> sets the Dynamic Island / Control Center color in iOS Safari
    if (document.querySelector('meta[name="theme-color"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#111110'; // matches --site-bg-color
    document.head.appendChild(meta);
  }

  async function loadIncludes() {
    const includes = document.querySelectorAll('[data-include]');
    const promises = Array.from(includes).map(async (el) => {
      const url = el.dataset.include;
      if (url) {
        const content = await fetchPartial(url);
        if (content) {
          const sanitized = localSanitizeHTML(content);
          el.replaceChildren(...Array.from(sanitized.childNodes));

          const event = new CustomEvent('partialLoaded', {
            detail: { url, element: el },
            bubbles: true
          });
          el.dispatchEvent(event);
        }
      }
    });
    await Promise.all(promises);
  }

  function initCookieConsent() {
    if (typeof localStorage === 'undefined') return;

    const consent = localStorage.getItem('cookie-consent-choice');
    if (consent === 'accept') {
      loadVercelAnalytics();
    }

    if (consent !== null) {
      return;
    }

    const consentHTML = `
      <div id="cookie-consent-banner" class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-full md:max-w-xl z-50 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-5 transition-all duration-500 transform translate-y-12 opacity-0 select-none" style="background-color: #090908;">
        <div class="flex items-center gap-2">
          <span class="text-xl">🍪</span>
          <h4 class="text-lg font-bold text-white tracking-tight">Cookie Consent</h4>
        </div>
        <p class="text-xs md:text-sm text-[#bcbcbc] leading-relaxed font-normal">
          Cookies are essential to provide the full experience. Read how we manage cookies in our Privacy Policy, or accept all cookies to continue using the website.
        </p>
        <div class="flex items-center gap-3 mt-1 w-full">
          <button id="cookie-accept-btn" class="flex-1 px-3 py-2.5 text-[11px] sm:text-xs font-bold rounded-full bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer text-center justify-center flex items-center">
            Accept all
          </button>
          <button id="cookie-decline-btn" class="flex-1 px-3 py-2.5 text-[11px] sm:text-xs font-bold rounded-full text-white hover:bg-white/10 transition-all duration-300 cursor-pointer bg-transparent border-0 text-center justify-center flex items-center">
            Reject all
          </button>
          <a href="/privacy_policy" class="flex-1 px-3 py-2.5 text-[11px] sm:text-xs font-bold rounded-full text-white hover:bg-white/10 transition-all duration-300 cursor-pointer bg-transparent border-0 text-center justify-center flex items-center no-underline">
            Learn more
          </a>
        </div>
      </div>
    `;

    const template = document.createElement('div');
    template.innerHTML = consentHTML.trim();
    const banner = template.firstChild;
    document.body.appendChild(banner);

    // Fade in animation
    setTimeout(() => {
      if (banner) {
        banner.classList.remove('translate-y-12', 'opacity-0');
        banner.classList.add('translate-y-0', 'opacity-100');
      }
    }, 100);

    const acceptBtn = banner.querySelector('#cookie-accept-btn');
    const declineBtn = banner.querySelector('#cookie-decline-btn');

    const handleChoice = (accepted) => {
      localStorage.setItem('cookie-consent-choice', accepted ? 'accept' : 'decline');
      if (accepted) {
        loadVercelAnalytics();
      }
      banner.classList.remove('translate-y-0', 'opacity-100');
      banner.classList.add('translate-y-12', 'opacity-0');
      setTimeout(() => {
        banner.remove();
      }, 500);
    };

    if (acceptBtn) acceptBtn.addEventListener('click', () => handleChoice(true));
    if (declineBtn) declineBtn.addEventListener('click', () => handleChoice(false));
  }

  if (typeof document !== 'undefined' && !globalThis.__TEST__) {
    const init = () => {
      ensureThemeColor();
      loadIncludes();
      initCookieConsent();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export for testing if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadIncludes, fetchPartial, initCookieConsent };
  }

  // Make loadIncludes available globally just in case other scripts need to re-trigger it
  globalThis.loadIncludes = loadIncludes;
})();
