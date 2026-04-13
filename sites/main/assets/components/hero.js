




(function() {
  'use strict';

  let lastW = null;
  let lastH = null;
  let heroRaf = null;




  function setPortraitVars() {
    const portrait = document.querySelector('.portrait');
    if (!portrait) return false;

    const rect = portrait.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width === lastW && height === lastH) return false;

    lastW = width;
    lastH = height;

    document.documentElement.style.setProperty('--portrait-w', width + 'px');
    document.documentElement.style.setProperty('--portrait-h', height + 'px');


    const leadMax = Math.round(width * 1.6);
    document.documentElement.style.setProperty('--lead-max', leadMax + 'px');

    return true;
  }




  function fitsWidth(element) {
    return element && (element.scrollWidth <= element.clientWidth + 1);
  }




  function fitToWidth(element, min, max) {
    if (!element) return false;

    let size = max;
    element.style.fontSize = size + 'px';
    let guard = 0;

    while (!fitsWidth(element) && size > min && guard < 160) {
      size--;
      element.style.fontSize = size + 'px';
      guard++;
    }

    return fitsWidth(element);
  }




  function fitHeroCopy() {
    const box = document.querySelector('.hero-copy-box');
    const title = document.querySelector('.hero-copy');
    
    if (!box || !title) return;

    const tmin = parseFloat(title.dataset.min) || 32;
    const tmax = parseFloat(title.dataset.max) || 56;
    let size = tmax;
    title.style.fontSize = size + 'px';
    let guard = 0;

    while (
      guard < 220 &&
      (title.scrollWidth > box.clientWidth + 1 || title.scrollHeight > box.clientHeight + 1) &&
      size > tmin
    ) {
      size--;
      title.style.fontSize = size + 'px';
      guard++;
    }
  }



  function run() {
    setPortraitVars();
    
    const greet = document.querySelector('.hero-greet');
    if (greet) {
      const gmin = parseFloat(greet.dataset.min) || 24;
      const gmax = parseFloat(greet.dataset.max) || 34;
      fitToWidth(greet, gmin, gmax);
    }
    
    fitHeroCopy();
  }




  function scheduleRun() {
    if (heroRaf) return;
    heroRaf = requestAnimationFrame(() => {
      heroRaf = null;
      run();
    });
  }




  function init() {
    window.addEventListener('DOMContentLoaded', scheduleRun);
    window.addEventListener('load', () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleRun).catch(scheduleRun);
      } else {
        scheduleRun();
      }
    });
    window.addEventListener('resize', scheduleRun);

    if ('ResizeObserver' in window) {
      const portrait = document.querySelector('.portrait');
      if (portrait) {
        new ResizeObserver(scheduleRun).observe(portrait);
      }
    }


    window.verifyLeadFits = function() {
      const box = document.querySelector('.hero-copy-box');
      const h = document.querySelector('.hero-copy');
      return !!box && !!h && h.scrollWidth <= box.clientWidth + 1 && h.scrollHeight <= box.clientHeight + 1;
    };

    window.fitLeadNow = scheduleRun;
  }


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
      setPortraitVars, 
      fitToWidth, 
      fitHeroCopy, 
      run, 
      init,
      fitsWidth
    };
  }


  init();
})();

