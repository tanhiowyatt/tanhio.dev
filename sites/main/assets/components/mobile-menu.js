
(function () {
  'use strict';

  function initMobileMenu() {
    const burgerButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeButton = document.getElementById('mobile-menu-close');

    if (!burgerButton || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add('menu-open');
      burgerButton.classList.add('active');
      document.body.style.overflow = 'hidden';
      burgerButton.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      mobileMenu.classList.remove('menu-open');
      burgerButton.classList.remove('active');
      document.body.style.overflow = '';
      burgerButton.setAttribute('aria-expanded', 'false');
    }

    burgerButton.onclick = (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('menu-open');
      if (isOpen) closeMenu();
      else openMenu();
    };

    if (closeButton) {
      closeButton.onclick = closeMenu;
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Close on link click
    const links = mobileMenu.querySelectorAll('a:not(.mobile-accordion-trigger)');
    links.forEach(l => {
      l.onclick = closeMenu;
    });

    // Accordion
    const triggers = mobileMenu.querySelectorAll('.mobile-accordion-trigger');
    triggers.forEach(t => {
      t.onclick = (e) => {
        e.stopPropagation();
        const content = t.nextElementSibling;
        const expanded = t.getAttribute('aria-expanded') === 'true';

        // Close others
        triggers.forEach(other => {
          if (other !== t) {
            other.setAttribute('aria-expanded', 'false');
            other.nextElementSibling.style.maxHeight = '0px';
          }
        });

        t.setAttribute('aria-expanded', !expanded);
        content.style.maxHeight = !expanded ? '500px' : '0px';
      };
    });
  }

  // Handle initialization with a simple retry
  function tryInit() {
    const burgerButton = document.getElementById('mobile-menu-button');
    if (burgerButton) {
      initMobileMenu();
    } else {
      setTimeout(tryInit, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
