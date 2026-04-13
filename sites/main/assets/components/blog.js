// Blog component - handles MDX blog posts listing and rendering

// Parse frontmatter from MDX content
function parseFrontmatter(content) {
  // More flexible regex to handle different newline formats and optional spaces
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // If no frontmatter found, return content as is
    return { frontmatter: {}, content: content.trim() };
  }

  const frontmatterText = match[1];
  const contentText = match[2];
  const frontmatter = {};

  // Simple YAML-like parsing for frontmatter
  frontmatterText.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  });

  return { frontmatter, content: contentText.trim() };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Convert MDX/Markdown to HTML
function markdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^\d+\.\s+(.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');

  html = html.replace(/^[-*]\s+(.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs (wrap consecutive lines that aren't already wrapped)
  const lines = html.split('\n');
  let result = [];
  let currentPara = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('<')) {
      if (currentPara.length > 0) {
        result.push('<p>' + currentPara.join(' ') + '</p>');
        currentPara = [];
      }
      if (trimmed) result.push(line);
    } else {
      currentPara.push(trimmed);
    }
  });

  if (currentPara.length > 0) {
    result.push('<p>' + currentPara.join(' ') + '</p>');
  }

  html = result.join('\n');

  // Clean up nested lists
  html = html.replace(/<\/li>\n<li>/g, '</li><li>');
  html = html.replace(/<ol>[\s\n]*<li>/g, '<ol><li>');
  html = html.replace(/<\/li>[\s\n]*<\/ol>/g, '</li></ol>');
  html = html.replace(/<ul>[\s\n]*<li>/g, '<ul><li>');
  html = html.replace(/<\/li>[\s\n]*<\/ul>/g, '</li></ul>');

  return html;
}

// Load and display blog posts
async function loadBlogPosts() {
  const postsContainer = document.getElementById('blog-posts');
  if (!postsContainer) {
    console.error('Blog posts container not found!');
    return;
  }

  // Ensure postsContainer is cleared
  postsContainer.innerHTML = '';

  // List of blog posts (absolute paths from root)
  const posts = [
    { slug: 'industrial-ussr', file: '/blog/posts/industrial-ussr.mdx' },
    { slug: 'icann', file: '/blog/posts/icann.mdx' },
    { slug: 'dogs-and-govs', file: '/blog/posts/dogs-and-govs.mdx' },
    { slug: 'thum', file: '/blog/posts/thum.mdx' },
    { slug: 'runet-blocks', file: '/blog/posts/runet-blocks.mdx' }
  ];

  try {
    const postsData = await Promise.all(
      posts.map(async (post) => {
        try {
          // Use absolute path to avoid relative resolution issues
          const response = await fetch(post.file);
          if (!response.ok) {
            console.warn(`Failed to fetch ${post.file}: ${response.status}`);
            return null;
          }
          const content = await response.text();
          const { frontmatter, content: markdownContent } = parseFrontmatter(content);
          return {
            ...post,
            ...frontmatter,
            excerptHTML: markdownToHTML(frontmatter.excerpt || ''),
          };
        } catch (error) {
          console.error("Error loading post %s:", post.file, error);
          return null;
        }
      })
    );

    const validPosts = postsData.filter(post => post !== null);

    // Sort by date (newest first)
    validPosts.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    // Render posts
    if (validPosts.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-slate-400';
      emptyMsg.textContent = 'No posts yet. Check back soon!';
      postsContainer.textContent = '';
      postsContainer.appendChild(emptyMsg);
      return;
    }

    // Sanitize HTML using the global utility
    const sanitizeHTML = (h) => {
      return typeof SanitizeHTML !== 'undefined' ? SanitizeHTML.sanitizeHTML(h) : escapeHtml(h);
    };

    // Build HTML string safely
    const htmlString = validPosts.map(post => {
      // Escape user-generated content
      const safeTitle = escapeHtml(post.title || 'Untitled');
      const safeSlug = escapeHtml(post.slug || '');
      const safeDate = post.date
        ? escapeHtml(new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
        : 'No date';

      // Sanitize excerpt HTML
      let safeExcerpt = '';
      if (post.excerptHTML) {
        safeExcerpt = sanitizeHTML(post.excerptHTML);
      } else if (post.excerpt) {
        safeExcerpt = escapeHtml(post.excerpt);
      }

      return `
      <article class="blog-post">
        <a href="${safeSlug}" class="blog-post-link">
          <h2 class="blog-post-title">${safeTitle}</h2>
          <div class="blog-post-meta">${safeDate}</div>
          <div class="blog-post-excerpt">${safeExcerpt}</div>
        </a>
      </article>
    `;
    }).join('');

    // Sanitize the entire HTML string before setting content
    SanitizeHTML.setSafeHTML(postsContainer, htmlString);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-slate-400';
    errorMsg.textContent = 'Error loading blog posts. Please try again later.';
    postsContainer.textContent = '';
    postsContainer.appendChild(errorMsg);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBlogPosts);
} else {
  loadBlogPosts();
}

