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
});
