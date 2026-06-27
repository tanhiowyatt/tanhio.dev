(function () {
  'use strict';

  const THRESHOLD = 10; // px от верха документа — зона «начало страницы»
  const CLASS = 'at-top'; // класс на <html>, включает iOS-стили header в mobile-ios.css

  function update() {
    document.documentElement.classList.toggle(CLASS, window.scrollY < THRESHOLD);
  }

  function bind() {
    update(); // начальное состояние (важно после reload с середины)

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
    window.addEventListener('load', update);     // после восстановления scroll
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
