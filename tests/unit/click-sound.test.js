/**
 * Unit Tests for Click Sound Utility
 */

globalThis.__TEST__ = true;

const ClickSound = require('../../sites/shared/assets/utils/click-sound.js');

describe('ClickSound', () => {
  let locationSpy;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="btn">Click me</button>
      <button id="disabled-btn" disabled>Disabled</button>
      <a href="/test" id="link">Link</a>
      <a href="https://external.com" id="ext-link">External</a>
    `;
    
    globalThis.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      cloneNode: function() { return this; },
      currentTime: 0
    }));

    // Mock location correctly for JSDOM
    locationSpy = jest.fn();
    delete globalThis.location;
    globalThis.location = { 
      href: 'http://localhost/',
      hostname: 'localhost',
      protocol: 'http:',
      assign: locationSpy
    };
    
    // Intercept location.href setter if possible, or just use assign
    Object.defineProperty(globalThis.location, 'href', {
      set: locationSpy,
      get: () => 'http://localhost/'
    });

    jest.useFakeTimers();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete globalThis.Audio;
  });

  test('should verify clickable targets', () => {
    const btn = document.getElementById('btn');
    const disabled = document.getElementById('disabled-btn');
    expect(ClickSound.isClickableTarget(btn)).toBe(true);
    expect(ClickSound.isClickableTarget(disabled)).toBe(false);
  });

  test('should respect MIN_INTERVAL', () => {
    expect(ClickSound.shouldPlay()).toBe(true);
    expect(ClickSound.shouldPlay()).toBe(false);
    jest.advanceTimersByTime(200); // MIN_INTERVAL is 100
    expect(ClickSound.shouldPlay()).toBe(true);
  });

  test('should handle navigation links', () => {
    const spy = jest.spyOn(ClickSound, 'playClickSound');
    ClickSound.init();
    const link = document.getElementById('link');
    
    // Simulate click
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    
    expect(spy).toHaveBeenCalled();
    jest.runAllTimers();
    expect(locationSpy).toHaveBeenCalled();
  });

  test('should play sound on button click', () => {
    const spy = jest.spyOn(ClickSound, 'playClickSound');
    ClickSound.init();
    const btn = document.getElementById('btn');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
