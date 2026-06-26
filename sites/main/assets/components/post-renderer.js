// Blog post renderer - handles individual MDX post rendering

// Parse frontmatter from MDX content
function parseFrontmatter(content) {
  const trimmedContent = (content || '').trim();
  const lines = trimmedContent.split(/\r?\n/);

  // Check if it starts with frontmatter delimiter
  if (lines.length < 3 || lines[0].trim() !== '---') {
    return { frontmatter: {}, content: trimmedContent };
  }

  // Find the closing delimiter
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return { frontmatter: {}, content: trimmedContent };
  }

  const frontmatterLines = lines.slice(1, closingIndex);
  const contentText = lines.slice(closingIndex + 1).join('\n');
  const frontmatter = {};

  // Simple YAML-like parsing for frontmatter
  frontmatterLines.forEach(line => {
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

// Convert simple markdown elements to HTML
function markdownToHTML(markdown) {
  if (!markdown) return '';
  
  // We sanitize AFTER some markdown processing or use a more specific approach
  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
             .replace(/^## (.*$)/gim, '<h2>$1</h2>')
             .replace(/^### (.*$)/gim, '<h3>$1</h3>')
             .replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    
  // Bold/Italic
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
             .replace(/\*(.*)\*/gim, '<em>$1</em>');
    
  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, (match, alt, src) => {
    let finalSrc = src;
    if (!src.startsWith('http') && !src.startsWith('/')) {
      const cleanSrc = src.replace(/^(\.\.\/|\.\/)+images\//, '').replace(/^(\.\.\/|\.\/)+/, '');
      finalSrc = `/blog/images/${cleanSrc}`;
    }
    return `<img src="${finalSrc}" alt="${alt}" class="blog-post-image">`;
  });
    
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
    
  // Blockquotes - support both > and &gt;
  html = html.replace(/^(>|&gt;)\s?([^\r\n]*)$/gim, '<blockquote>$2</blockquote>');
    
  // Lists
  html = html.replace(/^\s*-\s+(.*)/gim, '<li>$1</li>')
             .replace(/^\s*\d\.\s+(.*)/gim, '<li>$1</li>');
    
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
             .replace(/`(.*?)`/gim, '<code>$1</code>');
    
  // Paragraphs
  const processedLines = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.match(/^<(h\d|li|blockquote|pre|img|a)/i)) return trimmed;
      return `<p>${trimmed}</p>`;
    });
    
  return processedLines.filter(Boolean).join('\n');
}

// Update page metadata
function updateMetadata(frontmatter) {
  if (!frontmatter) return;

  const siteTitle = 'tanhiowyatt';
  
  if (frontmatter.title) {
    document.title = `${frontmatter.title} | ${siteTitle}`;
    updateMetaTag('property', 'og:title', frontmatter.title);
    updateMetaTag('name', 'twitter:title', frontmatter.title);
  }

  if (frontmatter.description) {
    updateMetaTag('name', 'description', frontmatter.description);
    updateMetaTag('property', 'og:description', frontmatter.description);
    updateMetaTag('name', 'twitter:description', frontmatter.description);
  }

  if (frontmatter.image) {
    const imageUrl = frontmatter.image.startsWith('http') 
      ? frontmatter.image 
      : `https://tanhio.dev/blog/images/${frontmatter.image}`;
    updateMetaTag('property', 'og:image', imageUrl);
    updateMetaTag('name', 'twitter:image', imageUrl);
  }
}

function updateMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content || '');
}

function getPostSlug() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const slugParam = urlParams.get('post');
  if (slugParam) return slugParam;

  const path = globalThis.location.pathname;
  // Handle /blog/slug or /blog/slug.html
  const match = /\/blog\/([^/.]+)(?:\.html)?$/.exec(path);
  return match ? match[1] : null;
}

async function fetchPostContent(slug) {
  const paths = [
    `/blog/posts/${slug}.mdx`,
    `./posts/${slug}.mdx`,
    `../posts/${slug}.mdx`
  ];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response?.ok) return response;
    } catch {
      // Ignore error to try alternative paths
    }
  }
  return null;
}

function displayError(container, message) {
  if (!container) return;
  container.innerHTML = `<div class="error-container"><p>${message}</p></div>`;
}

async function loadBlogPost() {
  const headerContainer = document.getElementById('blog-post-header');
  const postContainer = document.getElementById('blog-post-content');
  if (!postContainer) return;

  const slug = getPostSlug();
  if (!slug) {
    displayError(postContainer, 'Post not found.');
    return;
  }

  try {
    const response = await fetchPostContent(slug);
    if (!response) throw new Error('Not found');

    const text = await response.text();
    const { frontmatter, content } = parseFrontmatter(text);

    updateMetadata(frontmatter);

    if (headerContainer && frontmatter.title) {
      const dateStr = frontmatter.date 
        ? new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      let dateHtml = '';
      if (dateStr) {
        dateHtml = `<p>${dateStr}</p>`;
      }
      headerContainer.innerHTML = `<h1>${frontmatter.title}</h1>${dateHtml}`;
    }

    const htmlContent = markdownToHTML(content);
    if (typeof SanitizeHTML === 'undefined') {
      postContainer.innerHTML = htmlContent;
    } else {
      SanitizeHTML.setSafeHTML(postContainer, htmlContent);
    }
  } catch (error) {
    console.error('Error loading post:', error);
    displayError(postContainer, 'Error loading post.');
  }
}

const PostRenderer = {
  parseFrontmatter,
  markdownToHTML,
  updateMetadata,
  loadBlogPost,
  getPostSlug
};

if (typeof globalThis !== 'undefined') globalThis.PostRenderer = PostRenderer;
if (typeof module !== 'undefined' && module.exports) module.exports = PostRenderer;

// Auto-init on page load
if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPost);
  } else {
    loadBlogPost();
  }
}
