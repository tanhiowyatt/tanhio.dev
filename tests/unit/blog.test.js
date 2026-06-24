/**
 * Unit Tests for Blog Component
 */

globalThis.__TEST__ = true;

const Blog = require('../../sites/main/assets/components/blog.js');

describe('Blog', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="blog-posts"></div>
    `;
    
    globalThis.SanitizeHTML = {
      setSafeHTML: jest.fn((el, html) => { el.innerHTML = html; }),
      sanitizeHTML: jest.fn(html => html)
    };

    jest.restoreAllMocks();
  });

  afterEach(() => {
    delete globalThis.SanitizeHTML;
  });

  describe('markdownToHTML', () => {
    test('should parse headers', () => {
      expect(Blog.markdownToHTML('# Header 1')).toContain('<h1>Header 1</h1>');
      expect(Blog.markdownToHTML('## Header 2')).toContain('<h2>Header 2</h2>');
      expect(Blog.markdownToHTML('### Header 3')).toContain('<h3>Header 3</h3>');
    });

    test('should parse bold and italic', () => {
      expect(Blog.markdownToHTML('**Bold**')).toContain('<strong>Bold</strong>');
      expect(Blog.markdownToHTML('*Italic*')).toContain('<em>Italic</em>');
    });

    test('should parse links and code', () => {
      expect(Blog.markdownToHTML('[Link](https://test.com)')).toContain('<a href="https://test.com">Link</a>');
      expect(Blog.markdownToHTML('`code`')).toContain('<code>code</code>');
    });

    test('should parse lists', () => {
      expect(Blog.markdownToHTML('- Item')).toContain('<li>Item</li>');
      expect(Blog.markdownToHTML('1. Ordered')).toContain('<li>1. Ordered</li>');
    });

    test('should wrap paragraphs', () => {
      const html = Blog.markdownToHTML('Line 1\nLine 2');
      expect(html).toContain('<p>Line 1</p>');
      expect(html).toContain('<p>Line 2</p>');
    });

    test('should handle empty input', () => {
      expect(Blog.markdownToHTML('')).toBe('');
      expect(Blog.markdownToHTML(null)).toBe('');
    });
  });

  describe('loadBlogPosts', () => {
    test('should render posts on success', async () => {
      const mdxContent = '---\ntitle: Test Post\ndate: 2024-05-11\nexcerpt: This is an excerpt\n---\nContent';
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mdxContent)
      });

      await Blog.loadBlogPosts();
      
      const container = document.getElementById('blog-posts');
      expect(container.innerHTML).toContain('Test Post');
    });

    test('should handle fetch errors', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Fail'));
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await Blog.loadBlogPosts();
      
      const container = document.getElementById('blog-posts');
      expect(container.innerHTML).toContain('No posts yet');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="blog-filter-wrapper">
          <button class="blog-filter-btn active" data-category="all">All</button>
          <button class="blog-filter-btn" data-category="it">IT</button>
          <button class="blog-filter-btn" data-category="non-it">Non-IT</button>
        </div>
        <div id="blog-posts"></div>
      `;
    });

    test('initBlogFilters should change active button class on click', () => {
      Blog.initBlogFilters();
      const itButton = document.querySelector('.blog-filter-btn[data-category="it"]');
      const allButton = document.querySelector('.blog-filter-btn[data-category="all"]');

      expect(allButton.classList.contains('active')).toBe(true);
      expect(itButton.classList.contains('active')).toBe(false);

      itButton.click();

      expect(allButton.classList.contains('active')).toBe(false);
      expect(itButton.classList.contains('active')).toBe(true);
    });

    test('should filter posts based on active button category', async () => {
      const posts = [
        '---\ntitle: IT Post\ndate: 2024-05-11\ncategory: it\nexcerpt: IT excerpt\n---\nIT Content',
        '---\ntitle: Non-IT Post\ndate: 2024-05-10\ncategory: non-it\nexcerpt: Non-IT excerpt\n---\nNon-IT Content'
      ];
      
      let fetchCount = 0;
      globalThis.fetch = jest.fn().mockImplementation(() => {
        const content = posts[fetchCount % posts.length];
        fetchCount++;
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(content)
        });
      });

      Blog.initBlogFilters();
      
      // Load initially (All)
      await Blog.loadBlogPosts();
      let container = document.getElementById('blog-posts');
      expect(container.innerHTML).toContain('IT Post');
      expect(container.innerHTML).toContain('Non-IT Post');

      // Click IT
      const itButton = document.querySelector('.blog-filter-btn[data-category="it"]');
      itButton.click();
      
      await new Promise(process.nextTick);
      
      expect(container.innerHTML).toContain('IT Post');
      expect(container.innerHTML).not.toContain('Non-IT Post');
    });
  });

  describe('escapeHtml', () => {
    test('should escape special characters', () => {
      expect(Blog.escapeHtml('< > & " \'')).toBe('&lt; &gt; &amp; &quot; &#039;');
    });
    
    test('should handle non-string input', () => {
      expect(Blog.escapeHtml(null)).toBe('');
      expect(Blog.escapeHtml(123)).toBe('123');
    });
  });
});
