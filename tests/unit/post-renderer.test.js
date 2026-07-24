/**
 * Unit Tests for Post Renderer
 */

const PostRenderer = require('../../sites/shared/assets/components/post-renderer.js');

describe('PostRenderer', () => {
  beforeEach(() => {
    // Manually add head tags to ensure they exist
    document.head.innerHTML = `
      <title>Default Title</title>
      <meta property="og:title" content="">
      <meta property="og:description" content="">
      <meta property="og:image" content="">
      <meta name="twitter:title" content="">
      <meta name="twitter:description" content="">
    `;
    document.body.innerHTML = `
      <div id="blog-post-header"></div>
      <div id="blog-post-content"></div>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('full render cycle', () => {
    test('should render header and content correctly', async () => {
      // Mock location
      delete globalThis.location;
      globalThis.location = new URL('http://localhost/blog/test-slug.html');

      // Use absolute start for regex compatibility
      const mdxContent = '---\ntitle: Success Title\ndate: 2024-05-11\ndescription: Success Desc\nimage: img.png\n---\n# Content Body';

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mdxContent)
      });

      await PostRenderer.loadBlogPost();

      const header = document.getElementById('blog-post-header');
      const content = document.getElementById('blog-post-content');

      // Check DOM updates
      expect(header.innerHTML).toContain('Success Title');
      expect(content.innerHTML).toContain('<h1>Content Body</h1>');
      
      // Check Metadata updates
      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle.getAttribute('content')).toBe('Success Title');
      expect(document.title).toContain('Success Title');
    });
  });

  describe('markdown coverage', () => {
    test('should handle various md elements', () => {
      const md = '# H1\n## H2\n\n- List\n\n> Quote\n\n[Link](url)\n\n**Bold**\n`Code`';
      const html = PostRenderer.markdownToHTML(md);
      expect(html).toContain('<h1>H1</h1>');
      expect(html).toContain('<h2>H2</h2>');
      expect(html).toContain('<li>List</li>');
      expect(html).toContain('<blockquote>Quote</blockquote>');
      expect(html).toContain('<a href="url">Link</a>');
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<code>Code</code>');
    });
  });

  describe('translation & language switching', () => {
    beforeEach(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      document.body.innerHTML = `
        <a href="/blog/" id="blog-back-link">
          <span>Back to Blog</span>
        </a>
        <div id="blog-lang-switcher"></div>
        <div id="blog-post-header"></div>
        <div id="blog-post-content"></div>
      `;
    });

    test('should get and set language correctly', () => {
      const originalLanguage = navigator.language;
      Object.defineProperty(navigator, 'language', { value: '', configurable: true });
      expect(PostRenderer.getBlogLanguage()).toBe('en'); // default when no navigator language matches

      Object.defineProperty(navigator, 'language', { value: 'pl-PL', configurable: true });
      expect(PostRenderer.getBlogLanguage()).toBe('pl'); // detect from navigator

      Object.defineProperty(navigator, 'language', { value: originalLanguage, configurable: true });
      PostRenderer.setBlogLanguage('en');
      expect(PostRenderer.getBlogLanguage()).toBe('en');
      PostRenderer.setBlogLanguage('pl');
      expect(PostRenderer.getBlogLanguage()).toBe('pl');
    });

    test('should render language switcher buttons', () => {
      PostRenderer.setBlogLanguage('pl');
      PostRenderer.renderLanguageSwitcher();
      const switcher = document.getElementById('blog-lang-switcher');
      expect(switcher.querySelectorAll('.blog-lang-btn')).toHaveLength(3);
      
      const activeBtn = switcher.querySelector('.blog-lang-btn.active');
      expect(activeBtn.dataset.lang).toBe('pl');
    });

    test('should localize back link URL and keep text as Back to Blog', async () => {
      delete globalThis.location;
      globalThis.location = new URL('http://localhost/blog/test-slug.html');

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('---\ntitle: Success Title\n---\nBody')
      });

      document.documentElement.lang = 'pl';
      await PostRenderer.loadBlogPost();

      const backLink = document.getElementById('blog-back-link');
      const backLinkSpan = document.querySelector('#blog-back-link span');
      expect(backLink.getAttribute('href')).toBe('/blog/pl');
      expect(backLinkSpan.textContent).toBe('Back to Blog');
    });

    test('clicking language switcher button should redirect to correct URL', () => {
      const originalLocation = globalThis.location;
      delete globalThis.location;
      globalThis.location = { href: 'http://localhost/blog/pl/thum', pathname: '/blog/pl/thum' };

      document.documentElement.lang = 'pl';
      PostRenderer.renderLanguageSwitcher();
      const switcher = document.getElementById('blog-lang-switcher');
      const enBtn = switcher.querySelector('.blog-lang-btn[data-lang="en"]');
      
      enBtn.click();
      
      expect(globalThis.location.href).toBe('/blog/en/thum');

      globalThis.location = originalLocation;
      document.documentElement.removeAttribute('lang');
    });
  });
});
