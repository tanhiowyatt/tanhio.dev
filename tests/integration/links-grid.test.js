/**
 * Integration Tests for Links Grid
 */

const LinksGrid = require('../../sites/main/assets/components/links-grid.js');

describe('LinksGrid', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="links" style="width: 1000px">
        <div class="filter-controls">
          <button class="filter-btn active" data-category="all">All</button>
        </div>
        <div class="links-grid">
          <div class="link-card square tech" data-category="tech" style="width: 250px"></div>
        </div>
      </div>
    `;
    
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn().mockImplementation(function() {
      if (this.classList.contains('square')) return { width: 250, height: 250 };
      if (this.id === 'links') return { width: 1000, height: 1000 };
      return { width: 0, height: 0 };
    });

    // Mock requestAnimationFrame
    globalThis.requestAnimationFrame = jest.fn(cb => cb());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initTileSizing should set --tile variable', () => {
    LinksGrid.initTileSizing();
    expect(document.documentElement.style.getPropertyValue('--tile')).toBe('250px');
  });

  test('initCategoryFiltering should work', () => {
    LinksGrid.initCategoryFiltering();
    const btn = document.querySelector('.filter-btn');
    btn.click();
    expect(btn.classList.contains('active')).toBe(true);
  });
});
