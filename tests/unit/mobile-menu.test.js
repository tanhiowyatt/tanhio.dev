/**
 * Unit Tests for Mobile Menu
 */

const MobileMenu = require('../../sites/main/assets/components/mobile-menu.js');

describe('MobileMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="mobile-menu-button" aria-expanded="false" aria-controls="mobile-menu">Open</button>
      <button id="mobile-menu-close">Close</button>
      <nav id="mobile-menu" class="mobile-menu">
        <li class="mobile-accordion">
          <button class="mobile-accordion-trigger" aria-expanded="false">Accordion</button>
          <div class="mobile-accordion-content" style="max-height: 0px"></div>
        </li>
      </nav>
    `;
    
    // We need to re-initialize because the module usually runs on load
    MobileMenu.init();
  });

  test('should toggle menu on button click', () => {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    
    btn.click();
    expect(menu.classList.contains('menu-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    
    btn.click();
    expect(menu.classList.contains('menu-open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('should close menu on close button click', () => {
    const btn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menu = document.getElementById('mobile-menu');
    
    btn.click();
    expect(menu.classList.contains('menu-open')).toBe(true);
    
    closeBtn.click();
    expect(menu.classList.contains('menu-open')).toBe(false);
  });

  test('should toggle accordion on trigger click', () => {
    const trigger = document.querySelector('.mobile-accordion-trigger');
    const content = document.querySelector('.mobile-accordion-content');
    
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.style.maxHeight).toBe('500px');
    
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(content.style.maxHeight).toBe('0px');
  });
});
