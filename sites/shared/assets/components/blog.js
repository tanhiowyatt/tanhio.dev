// Blog component - handles MDX blog posts listing and rendering

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
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Convert MDX/Markdown to HTML
function markdownToHTML(markdown) {
  if (!markdown) return '';
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^* \n][^*\n]*)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^ \n][^*\n]*)\*/g, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`([^`\n]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`);

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    return `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
  });

  // Lists
  html = html.replace(/^(\d+)\.\s+(.*)$/gim, '<li>$1. $2</li>');
  html = html.replace(/^[-*]\s+(.*)$/gim, '<li>$1</li>');

  // Simple paragraph wrapping for remaining lines
  const lines = html.split(/\r?\n/);
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return `<p>${trimmed}</p>`;
  }).filter(Boolean).join('\n');
}

// Create a post card HTML string
function createPostCard(post, sanitizeHTML) {
  const safeTitle = escapeHtml(post.title || 'Untitled');
  const safeSlug = escapeHtml(post.slug || '#');
  const safeDate = post.date
    ? escapeHtml(new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    : 'No date';

  // Sanitize excerpt HTML
  let safeExcerpt = '';
  const excerptSource = post.excerptHTML || post.excerpt || '';
  if (post.excerptHTML && typeof sanitizeHTML === 'function') {
    safeExcerpt = sanitizeHTML(post.excerptHTML);
  } else {
    safeExcerpt = escapeHtml(excerptSource);
  }

  let imageHtml = '';
  if (post.image) {
    const safeImage = escapeHtml(post.image);
    imageHtml = `
      <div class="blog-post-image-wrapper">
        <img src="${safeImage}" alt="${safeTitle}" class="blog-post-image" loading="lazy" />
      </div>
    `;
  }

  return `
    <article class="blog-post">
      <a href="${safeSlug}" class="blog-post-link">
        <div class="blog-post-card-layout">
          ${imageHtml}
          <div class="blog-post-content-layout">
            <h2 class="blog-post-title">${safeTitle}</h2>
            <div class="blog-post-meta">${safeDate}</div>
            <div class="blog-post-excerpt">${safeExcerpt}</div>
          </div>
        </div>
      </a>
    </article>
  `;
}

let cachedPosts = null;

// Render list of filtered posts
function renderFilteredPosts(posts, category, container) {
  if (posts.length === 0) {
    container.innerHTML = '<p class="text-slate-400">No posts yet. Check back soon!</p>';
    return;
  }

  const filtered = posts.filter(post => {
    if (category === 'all') return true;
    return post.category === category;
  });

  // Trigger micro-animation reflow
  container.classList.remove('fade-in-active');
  container.offsetWidth; // Force reflow
  container.classList.add('fade-in-active');

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-slate-400">No posts in this category yet. Check back soon!</p>';
    return;
  }

  const sanitizer = (h) => {
    return typeof SanitizeHTML === 'undefined' ? escapeHtml(h) : SanitizeHTML.sanitizeHTML(h);
  };

  const htmlString = filtered.map(post => createPostCard(post, sanitizer)).join('');

  if (typeof SanitizeHTML === 'undefined') {
    container.innerHTML = htmlString;
  } else {
    SanitizeHTML.setSafeHTML(container, htmlString);
  }
}

// Load and display blog posts
async function loadBlogPosts() {
  const postsContainer = document.getElementById('blog-posts');
  if (!postsContainer) {
    console.error('Blog posts container not found!');
    return;
  }

  // Determine selected category
  const activeBtn = document.querySelector('.blog-filter-btn.active');
  const activeCategory = activeBtn ? activeBtn.dataset.category : 'all';

  const isTest = typeof globalThis !== 'undefined' && globalThis.__TEST__;
  if (cachedPosts && !isTest) {
    renderFilteredPosts(cachedPosts, activeCategory, postsContainer);
    return;
  }

  postsContainer.innerHTML = '';

  const posts = [
    { slug: '/blog/industrial-ussr', file: '/blog/posts/industrial-ussr.mdx' },
    { slug: '/blog/icann', file: '/blog/posts/icann.mdx' },
    { slug: '/blog/dogs-and-govs', file: '/blog/posts/dogs-and-govs.mdx' },
    { slug: '/blog/thum', file: '/blog/posts/thum.mdx' },
    { slug: '/blog/runet-blocks', file: '/blog/posts/runet-blocks.mdx' }
  ];

  try {
    const postsData = await Promise.all(
      posts.map(async (post) => {
        try {
          const response = await fetch(post.file);
          if (!response.ok) return null;
          const content = await response.text();
          const { frontmatter, content: contentText } = parseFrontmatter(content);
          
          // Extract first image if exists
          const imageRegex = /!\[.*?\]\((.*?)\)/;
          const imageMatch = contentText.match(imageRegex);
          let image = null;
          if (imageMatch) {
            image = imageMatch[1].replace(/^\.\.\//, '/blog/');
          }

          return {
            ...post,
            ...frontmatter,
            image,
            excerptHTML: markdownToHTML(frontmatter.excerpt || ''),
          };
        } catch {
          return null;
        }
      })
    );

    const validPosts = postsData.filter(post => post !== null);

    validPosts.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    if (!isTest) {
      cachedPosts = validPosts;
    }

    renderFilteredPosts(validPosts, activeCategory, postsContainer);
  } catch (error) {
    console.error('Error loading blog posts:', error);
    postsContainer.innerHTML = '<p class="text-slate-400">Error loading blog posts. Please try again later.</p>';
  }
}

// Initialize filter buttons behavior
function initBlogFilters() {
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  if (!filterBtns.length) return;

  // 1. Read initial category from URL query parameter
  const urlParams = new URLSearchParams(globalThis.location.search);
  const initialCategory = urlParams.get('category') || 'all';

  // 2. Set the active class on the corresponding button
  let hasActive = false;
  filterBtns.forEach(btn => {
    if (btn.dataset.category === initialCategory) {
      btn.classList.add('active');
      btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      btn.classList.add('bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
      hasActive = true;
    } else {
      btn.classList.remove('active', 'bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
      btn.classList.add('text-slate-400', 'hover:text-slate-200');
    }
  });

  // Fallback to "all" if the parameter category button wasn't found
  if (!hasActive) {
    const allBtn = Array.from(filterBtns).find(btn => btn.dataset.category === 'all');
    if (allBtn) {
      allBtn.classList.add('active');
      allBtn.classList.remove('text-slate-400', 'hover:text-slate-200');
      allBtn.classList.add('bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
    }
  }

  // 3. Add event listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Deactivate all buttons
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
        b.classList.add('text-slate-400', 'hover:text-slate-200');
      });

      // Activate clicked button
      btn.classList.add('active');
      btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      btn.classList.add('bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');

      // Update URL search parameters
      const url = new URL(globalThis.location.href);
      if (category === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      globalThis.history.pushState({}, '', url);

      // Re-load posts (uses cache if available)
      loadBlogPosts();
    });
  });

  // 4. Handle popstate (back/forward browser navigation)
  globalThis.addEventListener('popstate', () => {
    const currentParams = new URLSearchParams(globalThis.location.search);
    const currentCategory = currentParams.get('category') || 'all';

    filterBtns.forEach(btn => {
      if (btn.dataset.category === currentCategory) {
        btn.classList.add('active');
        btn.classList.remove('text-slate-400', 'hover:text-slate-200');
        btn.classList.add('bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
      } else {
        btn.classList.remove('active', 'bg-[#4b68ff]', 'text-white', 'shadow-lg', 'shadow-[#4b68ff]/20');
        btn.classList.add('text-slate-400', 'hover:text-slate-200');
      }
    });

    loadBlogPosts();
  });
}

const Blog = {
  parseFrontmatter,
  markdownToHTML,
  loadBlogPosts,
  createPostCard,
  escapeHtml,
  initBlogFilters
};

if (typeof globalThis !== 'undefined') {
  globalThis.Blog = Blog;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Blog;
}

if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  const init = () => {
    initBlogFilters();
    loadBlogPosts();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
