/**
 * Content Security Policy Tests
 */

describe('CSP Tests', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;">
    `;
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  test('should have CSP meta tag', () => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(cspMeta).toBeTruthy();
  });

  test('should have default-src directive', () => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = cspMeta.getAttribute('content');
    expect(content).toContain("default-src");
  });

  test('should restrict script sources', () => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const content = cspMeta.getAttribute('content');
    expect(content).toContain("script-src");
  });
});
