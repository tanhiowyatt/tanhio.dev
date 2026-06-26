
'use strict';

let burgerButton = null;
let mobileMenu = null;
let closeButton = null;
let triggers = [];

function openMenu() {
  if (!mobileMenu || !burgerButton) return;
  mobileMenu.classList.add('menu-open');
  burgerButton.classList.add('active');
  document.body.style.overflow = 'hidden';
  burgerButton.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  if (!mobileMenu || !burgerButton) return;
  mobileMenu.classList.remove('menu-open');
  burgerButton.classList.remove('active');
  document.body.style.overflow = '';
  burgerButton.setAttribute('aria-expanded', 'false');
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeMenu();
}

function handleAccordionClick(e) {
  e.stopPropagation();
  const t = e.currentTarget;
  const content = t.nextElementSibling;
  const expanded = t.getAttribute('aria-expanded') === 'true';

  // Close others
  triggers.forEach(other => {
    if (other !== t) {
      other.setAttribute('aria-expanded', 'false');
      if (other.nextElementSibling) {
        other.nextElementSibling.style.maxHeight = '0px';
      }
    }
  });

  t.setAttribute('aria-expanded', String(!expanded));
  if (content) {
    content.style.maxHeight = expanded ? '0px' : '500px';
  }
}

function initMobileMenu() {
  burgerButton = document.getElementById('mobile-menu-button');
  mobileMenu = document.getElementById('mobile-menu');
  closeButton = document.getElementById('mobile-menu-close');

  if (!burgerButton || !mobileMenu) return;

  burgerButton.onclick = (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('menu-open')) closeMenu();
    else openMenu();
  };

  if (closeButton) {
    closeButton.onclick = closeMenu;
  }

  document.addEventListener('keydown', handleKeydown);

  const links = mobileMenu.querySelectorAll('a:not(.mobile-accordion-trigger)');
  links.forEach(l => {
    l.onclick = closeMenu;
  });

  triggers = mobileMenu.querySelectorAll('.mobile-accordion-trigger');
  triggers.forEach(t => {
    t.onclick = handleAccordionClick;
  });
}

function tryInit() {
  if (document.getElementById('mobile-menu-button')) {
    initMobileMenu();
  } else {
    setTimeout(tryInit, 200);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init: initMobileMenu, openMenu, closeMenu };
}
