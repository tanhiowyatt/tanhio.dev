/**
 * Unit Tests for Includes Component
 */

const Includes = require('../../sites/main/assets/components/includes.js');

describe('Includes', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-include="partials/header.html"></div>
      <div data-include="partials/footer.html"></div>
    `;

    // Mock fetch
    globalThis.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('header.html')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('<header>Mock Header</header>')
        });
      }
      return Promise.resolve({
        ok: false
      });
    });
  });

  describe('fetchPartial', () => {
    test('should fetch and return text for valid URL', async () => {
      const text = await Includes.fetchPartial('partials/header.html');
      expect(text).toBe('<header>Mock Header</header>');
    });

    test('should return null for invalid URL', async () => {
      const text = await Includes.fetchPartial('partials/invalid.html');
      expect(text).toBeNull();
    });
  });

  describe('loadIncludes', () => {
    test('should load content into data-include elements', async () => {
      await Includes.loadIncludes();
      
      const headerDiv = document.querySelector('[data-include="partials/header.html"]');
      expect(headerDiv.innerHTML).toBe('<header>Mock Header</header>');
      
      const footerDiv = document.querySelector('[data-include="partials/footer.html"]');
      expect(footerDiv.innerHTML).toBe(''); // Failed fetch
    });
  });

  describe('initCookieConsent', () => {
    let mockStorage = {};

    beforeEach(() => {
      mockStorage = {};
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: jest.fn(key => mockStorage[key] || null),
          setItem: jest.fn((key, value) => { mockStorage[key] = value; }),
          removeItem: jest.fn(key => { delete mockStorage[key]; }),
          clear: jest.fn(() => { mockStorage = {}; })
        },
        writable: true,
        configurable: true
      });
      document.body.innerHTML = '';
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should create the banner when no choice exists in localStorage', () => {
      Includes.initCookieConsent();
      const banner = document.getElementById('cookie-consent-banner');
      expect(banner).not.toBeNull();
      expect(banner.innerHTML).toContain('Privacy Policy');
    });

    test('should not create the banner when a choice exists in localStorage', () => {
      mockStorage['cookie-consent-choice'] = 'accept';
      Includes.initCookieConsent();
      const banner = document.getElementById('cookie-consent-banner');
      expect(banner).toBeNull();
    });

    test('should save accept and remove banner on Accept click', () => {
      Includes.initCookieConsent();
      const banner = document.getElementById('cookie-consent-banner');
      const acceptBtn = document.getElementById('cookie-accept-btn');
      
      expect(acceptBtn).not.toBeNull();
      acceptBtn.click();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent-choice', 'accept');
      expect(mockStorage['cookie-consent-choice']).toBe('accept');

      // Fast-forward timers for transition out and DOM removal
      jest.advanceTimersByTime(500);
      expect(document.getElementById('cookie-consent-banner')).toBeNull();
    });

    test('should save decline and remove banner on Decline click', () => {
      Includes.initCookieConsent();
      const banner = document.getElementById('cookie-consent-banner');
      const declineBtn = document.getElementById('cookie-decline-btn');
      
      expect(declineBtn).not.toBeNull();
      declineBtn.click();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent-choice', 'decline');
      expect(mockStorage['cookie-consent-choice']).toBe('decline');

      // Fast-forward timers for transition out and DOM removal
      jest.advanceTimersByTime(500);
      expect(document.getElementById('cookie-consent-banner')).toBeNull();
    });
  });
});
