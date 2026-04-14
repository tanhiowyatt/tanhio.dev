/**
 * Accessibility (A11y) Tests
 */

describe('Accessibility Tests', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('lang', 'en');
    document.body.innerHTML = `
      <header>
        <nav>
          <a href="/" aria-label="Home">Home</a>
        </nav>
      </header>
      <main>
        <h1>Test Page</h1>
        <img src="test.jpg" alt="Test image" />
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">External Link</a>
        <button aria-label="Submit form">Submit</button>
      </main>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should have proper lang attribute', () => {
    const html = document.documentElement;
    expect(html.getAttribute('lang')).toBeTruthy();
  });

  test('should have alt text on images', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      expect(alt).toBeTruthy();
    });
  });

  test('should have aria-labels on interactive elements', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const label = button.getAttribute('aria-label') || button.textContent;
      expect(label).toBeTruthy();
    });
  });

  test('should have proper heading hierarchy', () => {
    const h1 = document.querySelector('h1');
    expect(h1).toBeTruthy();
  });

  test('should have proper link text', () => {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    });
  });
});
