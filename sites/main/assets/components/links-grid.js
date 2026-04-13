
(function() {
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
      linksSection.style.setProperty('--tile', width + 'px');
      
      if (window.__leaflet) {
        requestAnimationFrame(() => {
          if (window.__leaflet && typeof window.__leaflet.invalidateSize === 'function') {
            window.__leaflet.invalidateSize();
          }
        });
      }
    }

    function scheduleTile() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setTileSize();
      });
    }


    window.addEventListener('resize', scheduleTile);
    document.addEventListener('DOMContentLoaded', scheduleTile);
    window.addEventListener('load', scheduleTile);
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleTile).catch(() => {});
    }
    
    if ('ResizeObserver' in window) {
      const grid = linksSection.querySelector('.grid');
      if (grid) {
        new ResizeObserver(scheduleTile).observe(grid);
      }
    }
  }




  function handleMobileOddBlocks() {

    if (window.innerWidth > 768) return;
    
    const grid = document.querySelector('#links .grid');
    if (!grid) return;
    
    const socialBlocks = grid.querySelectorAll('.social-block');
    const socialCount = socialBlocks.length;
    

    if (socialCount % 2 === 1 && socialBlocks.length > 0) {
      const lastBlock = socialBlocks[socialBlocks.length - 1];
      lastBlock.classList.add('stretch-last');
    } else {

      socialBlocks.forEach(block => block.classList.remove('stretch-last'));
    }
  }




  function initSpotlightHover() {
    const linkCards = document.querySelectorAll('#links .link-card');
    
    linkCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width * 100) + '%';
        const my = ((e.clientY - rect.top) / rect.height * 100) + '%';
        card.style.setProperty('--mx', mx);
        card.style.setProperty('--my', my);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      });
    });
  }


  function init() {
    const initFunctions = () => {
      initTileSizing();
      initSpotlightHover();
      handleMobileOddBlocks();
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFunctions);
    } else {
      initFunctions();
    }
    
    window.addEventListener('resize', handleMobileOddBlocks);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTileSizing, initSpotlightHover, handleMobileOddBlocks, init };
    // Don't auto-init in test environment
    return;
  }

  init();
})();

