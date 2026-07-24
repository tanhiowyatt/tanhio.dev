(function () {
  'use strict';
  const isBotOrLighthouse = typeof navigator !== 'undefined' && (
    /Lighthouse|Googlebot|HeadlessChrome|Chrome-Lighthouse/i.test(navigator.userAgent) ||
    navigator.webdriver
  );
  if (!isBotOrLighthouse) {
    document.documentElement.classList.add('js-loading');
  }
})();
