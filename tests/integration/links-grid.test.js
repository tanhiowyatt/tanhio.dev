/**
 * Integration Tests for Links Grid Component
 */

const linksGrid = require('../../sites/main/assets/components/links-grid.js');

describe('Links Grid Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="links">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="link-card square" style="width: 200px;">
            <a href="https://github.com/test" target="_blank" rel="noopener noreferrer" class="stretched-link"></a>
            <div class="logo-badge"><i class="bi bi-github"></i></div>
            <div>
              <p class="uppercase tracking-wide text-[10px] text-slate-400">code</p>
              <h3 class="text-[15px] font-semibold">github</h3>
            </div>
          </div>
        </div>
      </section>
    `;
  });

  afterEach(() => {
    document.body.textContent = '';
  });

  test('should set tile size CSS variable', async () => {
    const linksSection = document.getElementById('links');
    linksGrid.initTileSizing();

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const tileValue = linksSection.style.getPropertyValue('--tile');
          expect(tileValue).toBeTruthy();
          expect(tileValue).toMatch(/^\d+px$/);
          resolve();
        });
      });
    });
  });

  test('should add hover spotlight effect', () => {
    const linkCard = document.querySelector('.link-card');
    const mockRect = {
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200
    };
    linkCard.getBoundingClientRect = jest.fn(() => mockRect);

    linksGrid.initSpotlightHover();

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
      bubbles: true
    });
    linkCard.dispatchEvent(mouseEvent);

    const mx = linkCard.style.getPropertyValue('--mx');
    const my = linkCard.style.getPropertyValue('--my');
    expect(mx).toBe('50%');
    expect(my).toBe('50%');
  });

  test('should have proper security attributes on external links', () => {
    const link = document.querySelector('a[href^="https://"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
