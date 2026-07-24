/**
 * Unit Tests for Hero Component
 */

const Hero = require('../../sites/shared/assets/components/hero.js');

describe('Hero', () => {
  beforeEach(() => {
    globalThis.__TEST__ = true;
    document.body.innerHTML = `
      <div class="hero">
        <div class="hero-copy-box" style="width: 500px; height: 500px">
          <div class="hero-copy">Copy</div>
        </div>
        <div class="hero-greet" style="width: 500px">Greet</div>
        <div class="portrait"></div>
      </div>
    `;
    
    // Mock getBoundingClientRect on prototype
    Element.prototype.getBoundingClientRect = jest.fn().mockImplementation(function() {
      if (this.classList.contains('hero-copy-box')) return { width: 500, height: 500 };
      if (this.classList.contains('hero-copy')) return { width: 1000, height: 100 };
      if (this.classList.contains('hero-greet')) return { width: 600, height: 50 };
      if (this.classList.contains('portrait')) return { width: 300, height: 300 };
      if (this.parentElement?.classList.contains('hero')) return { width: 500, height: 500 };
      return { width: 0, height: 0 };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete globalThis.__TEST__;
  });

  test('setPortraitVars should update CSS variables', () => {
    Hero.setPortraitVars();
    expect(document.documentElement.style.getPropertyValue('--portrait-w')).toBe('300px');
  });

  test('fitToWidth should reduce font size', () => {
    const greet = document.querySelector('.hero-greet');
    let callCount = 0;
    Hero.fitsWidth = jest.fn().mockImplementation(() => {
      callCount++;
      return callCount > 2;
    });
    
    Hero.fitToWidth(greet, 10, 20);
    expect(greet.style.fontSize).toBe('18px');
  });

  test('init should attach event listeners', () => {
    const spy = jest.spyOn(globalThis, 'addEventListener');
    Hero.init();
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(spy).toHaveBeenCalledWith('load', expect.any(Function));
  });

  test('run should call all sub-functions', () => {
    const portraitSpy = jest.spyOn(Hero, 'setPortraitVars');
    const copySpy = jest.spyOn(Hero, 'fitHeroCopy');
    Hero.run();
    expect(portraitSpy).toHaveBeenCalled();
    expect(copySpy).toHaveBeenCalled();
  });
});
