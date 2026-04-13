// Blog post renderer - handles individual MDX post rendering

// Parse frontmatter from MDX content
function parseFrontmatter(content) {
  // Trim potential BOM or leading whitespace
  const trimmedContent = content.trim();
  // Flexible regex for frontmatter blocks
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*([\s\S]*)$/;
  const match = trimmedContent.match(frontmatterRegex);

  if (!match) {
    console.warn('No frontmatter found in post content');
    return { frontmatter: {}, content: trimmedContent };
  }

  const frontmatterText = match[1];
  const contentText = match[2];
  const frontmatter = {};

  // Simple YAML-like parsing for frontmatter
  frontmatterText.split(/\r?\n/).forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
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

// Convert MDX/Markdown to HTML (robust version)
function markdownToHTML(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // 1. Headers
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 2. Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    let imagePath = src;
    if (src.startsWith('../images/')) {
      imagePath = `/blog/images/${src.replace('../images/', '')}`;
    } else if (!src.startsWith('http') && !src.startsWith('/')) {
      imagePath = `/blog/images/${src}`;
    }
    return `<img src="${imagePath}" alt="${escapeHtml(alt || '')}" class="blog-image" />`;
  });

  // 3. Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const lines = code.split('\n');
    const content = lines.slice(1).join('\n').trim();
    return `<pre><code>${escapeHtml(content)}</code></pre>`;
  });

  // 4. Inline formatting
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`);

  // 5. Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
  });

  // 6. Blockquotes
  html = html.replace(/^>\s+(.+)$/gim, '<blockquote>$1</blockquote>');

  // 7. Lists
  html = html.replace(/^(\d+)\.\s+(.+)$/gim, '<li>$2</li>');
  html = html.replace(/^[-*]\s+(.+)$/gim, '<li>$1</li>');

  // 8. Paragraphs and Line Breaks
  const blocks = html.split(/\n\s*\n/);
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    
    // Check if block already starts with an HTML tag we shouldn't wrap in <p>
    if (trimmed.match(/^<(h[1-6]|img|pre|blockquote|ul|ol|li|hr|div|section|article)/)) {
      return trimmed;
    }
    
    // Wrap other blocks in <p>
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });

  return processedBlocks.join('\n');
}

// Escape HTML for code blocks
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Get post slug from URL
function getPostSlug() {
  const path = window.location.pathname;
  const search = window.location.search;

  // Try to get slug from path (e.g., /blog/post.html or /blog/post)
  let match = path.match(/(?:^|\/)blog\/([^/]+?)(?:\.html)?$/);
  if (match) return match[1];

  // Try to match any .html file if we are already in /blog/
  if (path.includes('/blog/')) {
    match = path.match(/\/([^/]+)\.html$/);
    if (match) return match[1];
  }

  // Try query parameter as fallback
  if (search) {
    const params = new URLSearchParams(search);
    return params.get('slug') || params.get('post');
  }

  return null;
}

// Get correct path to MDX file based on current page location
function getPostPath(slug) {
  return `/blog/posts/${slug}.mdx`;
}

// Load and render blog post
async function loadBlogPost() {
  const postContainer = document.getElementById('blog-post-content');
  const postHeader = document.getElementById('blog-post-header');

  if (!postContainer) return;

  const slug = getPostSlug();
  if (!slug) {
    console.error('Could not determine post slug from URL:', window.location.pathname);
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-slate-400';
    errorMsg.textContent = 'Post not found. Could not determine post slug.';
    postContainer.textContent = '';
    postContainer.appendChild(errorMsg);
    return;
  }

  const postPath = getPostPath(slug);
  console.log('Loading post:', slug, 'from path:', postPath);

  // Try multiple variations just in case, including absolute and relative
  const pathVariations = [
    postPath,
    `posts/${slug}.mdx`,
    `./posts/${slug}.mdx`
  ];

  let response = null;
  let successfulPath = null;
  let lastError = null;

  for (const path of pathVariations) {
    try {
      console.log('Trying path:', path);
      const testResponse = await fetch(path);
      if (testResponse.ok) {
        response = testResponse;
        successfulPath = path;
        console.log('Successfully loaded from:', path);
        break;
      } else {
        console.warn(`Path ${path} returned ${testResponse.status}`);
      }
    } catch (error) {
      lastError = error;
      console.warn('Failed to load from', path, error);
      continue;
    }
  }

  try {
    if (!response || !response.ok) {
      console.error('All path attempts failed. Last error:', lastError);
      console.error('Tried paths:', pathVariations);
      console.error('Current location:', window.location.href);
      throw new Error(`Post not found. Tried: ${pathVariations.join(', ')}`);
    }

    const content = await response.text();
    const { frontmatter, content: markdownContent } = parseFrontmatter(content);

    // Update page title
    if (frontmatter.title) {
      document.title = `${frontmatter.title} — tanhiowyatt`;
    }


    // Render header - escape HTML to prevent XSS
    if (postHeader) {
      const safeTitle = escapeHtml(frontmatter.title || 'Untitled');
      let safeDate = '';
      
      if (frontmatter.date) {
        try {
          const dateObj = new Date(frontmatter.date);
          if (!isNaN(dateObj.getTime())) {
            safeDate = escapeHtml(dateObj.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }));
          }
        } catch (e) {
          console.warn('Failed to parse date:', frontmatter.date);
        }
      }

      const headerHTML = `
        <h1>${safeTitle}</h1>
        ${safeDate ? `<div class="blog-post-header-date">${safeDate}</div>` : ''}
      `;
      SanitizeHTML.setSafeHTML(postHeader, headerHTML);
    }

    // Render content - sanitize before setting content
    const htmlContent = markdownToHTML(markdownContent);
    SanitizeHTML.setSafeHTML(postContainer, htmlContent);

    // Add error handlers for images safely (avoid inline handlers)
    const images = postContainer.querySelectorAll('.blog-image');
    images.forEach(img => {
      img.addEventListener('error', function () {
        console.error('Failed to load image:', this.src);
        // Optionally add a fallback class for styling broken images
        this.classList.add('image-error');
      });
    });

    // Update meta tags - escape content for safety
    if (frontmatter.excerpt) {
      const safeExcerpt = escapeHtml(frontmatter.excerpt);

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = safeExcerpt;
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.content = safeExcerpt;
      }
    }

  } catch (error) {
    console.error('Error loading blog post:', error);
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-slate-400';
    errorMsg.textContent = 'Error loading post. Please try again later.';
    postContainer.textContent = '';
    postContainer.appendChild(errorMsg);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadBlogPost);
} else {
  loadBlogPost();
}


