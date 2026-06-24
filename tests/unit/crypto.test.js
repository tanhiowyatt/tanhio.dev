/**
 * Unit Tests for Crypto Component
 */

const Crypto = require('../../sites/main/assets/components/crypto.js');

describe('Crypto', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="addr-btc">1BTCAddress...</div>
      <button class="copy-btn" data-target="#addr-btc">Copy</button>
      <output id="copy-toast" class="stub-toast"></output>
    `;

    // Mock Clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCopyTextFrom', () => {
    test('should get text content from target', () => {
      const text = Crypto.getCopyTextFrom('#addr-btc');
      expect(text).toBe('1BTCAddress...');
    });

    test('should return null for non-existent target', () => {
      const text = Crypto.getCopyTextFrom('#none');
      expect(text).toBeNull();
    });
  });

  describe('copyText', () => {
    test('should copy text and show toast', async () => {
      const success = await Crypto.copyText('test text');
      expect(success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      
      const toast = document.getElementById('copy-toast');
      expect(toast.classList.contains('show')).toBe(true);
      
      jest.advanceTimersByTime(2000);
      expect(toast.classList.contains('show')).toBe(false);
    });
  });

  describe('handleCopyClick', () => {
    test('should handle button click', async () => {
      const button = document.querySelector('.copy-btn');
      const event = { target: button };
      
      await Crypto.handleCopyClick(event);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1BTCAddress...');
    });
  });
});
