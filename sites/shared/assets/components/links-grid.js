
'use strict';

function initTileSizing() {
  const linksSection = document.getElementById('links');
  if (!linksSection) return;

  let lastTile = null;
  let rafId = null;

  function setTileSize() {
    if (!linksSection) return;
    
    const probe = linksSection.querySelector('.link-card.square');
    if (!probe) return;
    
    const width = Math.round(probe.getBoundingClientRect().width);
    if (lastTile === width) return;
    
    lastTile = width;
    document.documentElement.style.setProperty('--tile', width + 'px');
  }

  function scheduleUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      setTileSize();
    });
  }

  globalThis.addEventListener('resize', scheduleUpdate);
  scheduleUpdate();

  // ResizeObserver for more accuracy
  if ('ResizeObserver' in globalThis) {
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(linksSection);
  }
}

function initCategoryFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.link-card');
  const grid = document.querySelector('.links-grid');

  if (!filterButtons.length || !cards.length || !grid) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Update buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      let visibleCount = 0;
      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Animation or empty state if needed
      if (visibleCount === 0) {
        // Show empty state
      }
    });
  });
}

function initGlowEffect() {
  document.querySelectorAll('.link-card').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
    el.addEventListener('mouseleave', () => {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  });
}

function init() {
  initTileSizing();
  initCategoryFiltering();
  initGlowEffect();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initTileSizing, initCategoryFiltering, initGlowEffect, init };
}
