/**
 * Jest setup file for DOM environment
 */

// SanitizeHTML Mock
globalThis.SanitizeHTML = {
  setSafeHTML: jest.fn().mockImplementation((el, html) => {
    if (el) el.innerHTML = html;
  }),
  sanitizeHTML: jest.fn().mockImplementation(html => html),
  sanitizeMarkdownHTML: jest.fn().mockImplementation(html => html)
};

// DOMPurify Mock
globalThis.DOMPurify = {
  sanitize: jest.fn().mockImplementation(html => html),
  isSupported: true
};

// Sanitizer Mock
globalThis.Sanitizer = jest.fn().mockImplementation(() => ({}));
Element.prototype.setHTML = jest.fn().mockImplementation(function(html) {
  this.innerHTML = html;
});

// Polyfill for TextEncoder/TextDecoder if not available
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('node:util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;

// Mock readyState
Object.defineProperty(dom.window.document, 'readyState', {
  get() { return 'complete'; },
  configurable: true
});

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

globalThis.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock fetch
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve('<div>Mock content</div>'),
    json: () => Promise.resolve({})
  })
);
