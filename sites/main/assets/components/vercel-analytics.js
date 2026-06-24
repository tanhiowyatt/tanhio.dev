(function () {
  'use strict';

  // Vercel Analytics Initialization
  // This function injects the Vercel Web Analytics script
  function initVercelAnalytics() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Create the queue if it doesn't exist
    if (!window.va) {
      window.va = function a(...params) {
        if (!window.vaq) window.vaq = [];
        window.vaq.push(params);
      };
    }

    // Check if script is already loaded
    const scriptSrc = '/_vercel/insights/script.js';
    if (document.head.querySelector(`script[src*="${scriptSrc}"]`)) return;

    // Create and inject the analytics script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.defer = true;
    
    // Add SDK metadata
    script.dataset.sdkn = '@vercel/analytics';
    script.dataset.sdkv = '2.0.1';

    script.onerror = () => {
      console.log(
        '[Vercel Web Analytics] Failed to load script. Be sure to enable Web Analytics for your project in Vercel dashboard and deploy. See https://vercel.com/docs/analytics/quickstart for more information.'
      );
    };

    document.head.appendChild(script);
  }

  // Initialize on DOM ready
  if (typeof document !== 'undefined' && !globalThis.__TEST__) {
    const init = () => {
      initVercelAnalytics();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export for testing if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initVercelAnalytics };
  }
})();
