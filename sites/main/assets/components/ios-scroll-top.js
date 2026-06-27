(function () {
  'use strict';

  const THRESHOLD = 10; // px from top of document — "at top of page" zone
  const CLASS = 'at-top'; // class on <html> that enables iOS header styles in mobile-ios.css

  function update() {
    document.documentElement.classList.toggle(CLASS, window.scrollY < THRESHOLD);
  }

  function bind() {
    update(); // set initial state (important after reload from mid-page)

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('pageshow', update); // bfcache / reload
    window.addEventListener('load', update);     // after scroll position is restored
  }

  document.addEventListener('partialLoaded', (e) => {
    if (e.detail?.url?.includes('header')) update();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
