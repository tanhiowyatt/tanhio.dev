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

const translations = {
  en: {
    title: "Blog",
    description: "Thoughts on security engineering, penetration testing, and building secure systems.",
    all: "All",
    it: "IT",
    nonIt: "Non-IT",
    noPosts: "No posts yet. Check back soon!",
    noPostsCategory: "No posts in this category yet. Check back soon!",
    errorLoading: "Error loading blog posts. Please try again later."
  },
  pl: {
    title: "Blog",
    description: "Przemyślenia na temat inżynierii bezpieczeństwa, testów penetracyjnych i budowania bezpiecznych systemów.",
    all: "Wszystko",
    it: "IT",
    nonIt: "Inne",
    noPosts: "Brak wpisów. Zajrzyj tu wkrótce!",
    noPostsCategory: "Brak wpisów w tej kategorii. Zajrzyj tu wkrótce!",
    errorLoading: "Błąd podczas ładowania wpisów. Spróbuj ponownie później."
  },
  ru: {
    title: "Блог",
    description: "Мысли об инженерии безопасности, пентестах и создании защищенных систем.",
    all: "Все",
    it: "IT",
    nonIt: "Не-IT",
    noPosts: "Постов пока нет. Загляните позже!",
    noPostsCategory: "В этой категории пока нет постов. Загляните позже!",
    errorLoading: "Ошибка при загрузке постов. Пожалуйста, попробуйте позже."
  }
};

function getBlogLanguage() {
  if (typeof globalThis !== 'undefined' && globalThis.location) {
    const path = globalThis.location.pathname || '';
    if (path.includes('/ru/') || path.endsWith('/ru')) return 'ru';
    if (path.includes('/pl/') || path.endsWith('/pl')) return 'pl';
  }

  if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
    const htmlLang = document.documentElement.lang.split('-')[0].toLowerCase();
    if (['en', 'pl', 'ru'].includes(htmlLang)) {
      return htmlLang;
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('blog-lang');
      if (saved && ['en', 'pl', 'ru'].includes(saved)) {
        return saved;
      }
    }
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const primary = navigator.language.split('-')[0].toLowerCase();
    if (['en', 'pl', 'ru'].includes(primary)) {
      return primary;
    }
  }

  return 'en';
}

function setBlogLanguage(lang) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('blog-lang', lang);
    }
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function navigateToLanguage(targetLang) {
  if (typeof globalThis === 'undefined' || !globalThis.location) return;
  
  const currentLang = getBlogLanguage();
  if (targetLang === currentLang) return;
  
  setBlogLanguage(targetLang);
  
  const path = globalThis.location.pathname || '';
  const isSubpath = path.startsWith('/blog');
  const base = isSubpath ? '/blog' : '';
  
  let cleanPath = path;
  if (isSubpath) {
    cleanPath = path.substring('/blog'.length);
  }
  
  if (cleanPath.startsWith('/ru/')) {
    cleanPath = cleanPath.substring('/ru'.length);
  } else if (cleanPath === '/ru') {
    cleanPath = '/';
  } else if (cleanPath.startsWith('/pl/')) {
    cleanPath = cleanPath.substring('/pl'.length);
  } else if (cleanPath === '/pl') {
    cleanPath = '/';
  } else if (cleanPath.startsWith('/en/')) {
    cleanPath = cleanPath.substring('/en'.length);
  } else if (cleanPath === '/en') {
    cleanPath = '/';
  }
  
  let newPath = '';
  if (targetLang === 'ru') {
    newPath = base + '/ru' + cleanPath;
  } else if (targetLang === 'pl') {
    newPath = base + '/pl' + cleanPath;
  } else if (targetLang === 'en') {
    newPath = base + '/en' + cleanPath;
  } else {
    newPath = base + cleanPath;
  }
  
  newPath = newPath.replace(/\/+/g, '/');
  if (newPath === '') newPath = '/';
  
  const search = globalThis.location.search || '';
  globalThis.location.href = newPath + search;
}

function updateBlogUIText() {
  // Kept strictly in English as per user request
}

function syncMobileLanguageSwitcher(currentLang, onLangChange) {
  const mobileContainer = document.getElementById('mobile-lang-switcher-container');
  if (!mobileContainer) return;

  mobileContainer.classList.remove('hidden');

  const buttons = mobileContainer.querySelectorAll('.blog-lang-btn');
  buttons.forEach(btn => {
    const isBtnActive = btn.dataset.lang === currentLang;
    if (isBtnActive) {
      btn.className = 'blog-lang-btn active flex-1 py-4 text-sm font-semibold rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer text-white';
    } else {
      btn.className = 'blog-lang-btn flex-1 py-4 text-sm font-semibold rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer text-slate-400 hover:text-slate-200';
    }

    btn.onclick = (e) => {
      e.preventDefault();
      const newLang = btn.dataset.lang;
      if (newLang === currentLang) return;
      onLangChange(newLang);
    };
  });
}

function renderLanguageSwitcher() {
  const container = document.getElementById('blog-lang-switcher');
  
  const currentLang = getBlogLanguage();
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'pl', label: 'PL' },
    { code: 'ru', label: 'RU' }
  ];

  // Render desktop switcher if container exists
  if (container) {
    const html = `
      <div class="blog-lang-pill p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md flex relative select-none w-full">
        ${languages.map(lang => {
          const isActive = lang.code === currentLang;
          const btnClass = isActive
            ? 'blog-lang-btn active flex-1 px-6 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer text-white'
            : 'blog-lang-btn flex-1 px-6 py-2 text-xs font-semibold rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer text-slate-400 hover:text-slate-200';
          return `<button class="${btnClass}" data-lang="${lang.code}">${lang.label}</button>`;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.blog-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.dataset.lang;
        navigateToLanguage(newLang);
      });
    });
  }

  // Sync mobile switcher in burger menu
  syncMobileLanguageSwitcher(currentLang, (newLang) => {
    navigateToLanguage(newLang);
  });
}

let cachedPosts = null;

// Render list of filtered posts
function renderFilteredPosts(posts, category, container) {
  const lang = getBlogLanguage();
  const t = translations[lang] || translations.en;

  if (posts.length === 0) {
    container.innerHTML = `<p class="text-slate-400">${t.noPosts}</p>`;
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
    container.innerHTML = `<p class="text-slate-400">${t.noPostsCategory}</p>`;
    return;
  }

  const sanitizer = (h) => {
    return typeof SanitizeHTML === 'undefined' ? escapeHtml(h) : SanitizeHTML.sanitizeHTML(h);
  };

  const htmlString = filtered.map(post => {
    const resolvedSlug = post.slug.replace(/^\/blog/, '');
    const currentLang = getBlogLanguage();
    const isSubpath = typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.pathname.startsWith('/blog');
    const base = isSubpath ? '/blog' : '';
    
    let localizedSlug = '';
    if (currentLang === 'ru') {
      localizedSlug = base + '/ru' + resolvedSlug;
    } else if (currentLang === 'pl') {
      localizedSlug = base + '/pl' + resolvedSlug;
    } else if (currentLang === 'en') {
      localizedSlug = base + '/en' + resolvedSlug;
    } else {
      localizedSlug = base + resolvedSlug;
    }
    
    return createPostCard({
      ...post,
      slug: localizedSlug.replace(/\/+/g, '/')
    }, sanitizer);
  }).join('');

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

  const posts = [
    { slug: '/blog/industrial-ussr', id: 'industrial-ussr' },
    { slug: '/blog/icann', id: 'icann' },
    { slug: '/blog/dogs-and-govs', id: 'dogs-and-govs' },
    { slug: '/blog/thum', id: 'thum' },
    { slug: '/blog/runet-blocks', id: 'runet-blocks' }
  ];

  try {
    const lang = getBlogLanguage();
    const isSubpath = typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.pathname.startsWith('/blog');
    const base = isSubpath ? '/blog' : '';

    const postsData = await Promise.all(
      posts.map(async (post) => {
        try {
          let response;
          const primaryPath = `${base}/${lang}/posts/${post.id}/${post.id}.mdx`.replace(/\/+/g, '/');
          
          try {
            response = await fetch(primaryPath);
          } catch {
            // Ignore error
          }

          if ((!response || !response.ok) && lang !== 'en') {
            const fallbackPath = `${base}/en/posts/${post.id}/${post.id}.mdx`.replace(/\/+/g, '/');
            try {
              response = await fetch(fallbackPath);
            } catch {
              // Ignore error
            }
          }

          if (!response || !response.ok) return null;
          const content = await response.text();
          const { frontmatter, content: contentText } = parseFrontmatter(content);
          
          // Extract first image if exists
          const imageRegex = /!\[.*?\]\((.*?)\)/;
          const imageMatch = contentText.match(imageRegex);
          let image = null;
          if (imageMatch) {
            let src = imageMatch[1];
            if (!src.startsWith('http') && !src.startsWith('/')) {
              const cleanSrc = src.replace(/^(\.\.\/|\.\/)+/, '');
              image = `${base}/${lang}/posts/${post.id}/${cleanSrc}`.replace(/\/+/g, '/');
            } else {
              image = src;
            }
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
    const lang = getBlogLanguage();
    const t = translations[lang] || translations.en;
    postsContainer.innerHTML = `<p class="text-slate-400">${t.errorLoading}</p>`;
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

function initRSSCopyButtons() {
  document.querySelectorAll('.rss-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const feedPath = btn.dataset.feed;
      const absoluteUrl = window.location.origin + feedPath;

      navigator.clipboard.writeText(absoluteUrl).then(() => {
        const textSpan = btn.querySelector('.rss-btn-text');
        const iconEl = btn.querySelector('i');
        if (textSpan && iconEl) {
          const originalText = textSpan.textContent;
          const originalIconClass = iconEl.className;
          
          textSpan.textContent = 'Copied!';
          iconEl.className = 'bi bi-check-lg copy-check-icon';
          btn.classList.add('active');

          setTimeout(() => {
            textSpan.textContent = originalText;
            iconEl.className = originalIconClass;
            btn.classList.remove('active');
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });
}

const Blog = {
  parseFrontmatter,
  markdownToHTML,
  loadBlogPosts,
  createPostCard,
  escapeHtml,
  initBlogFilters,
  getBlogLanguage,
  setBlogLanguage,
  renderLanguageSwitcher,
  updateBlogUIText,
  initRSSCopyButtons,
  translations
};

if (typeof globalThis !== 'undefined') {
  globalThis.Blog = Blog;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Blog;
}

if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  const init = () => {
    updateBlogUIText();
    renderLanguageSwitcher();
    initBlogFilters();
    loadBlogPosts();
    initRSSCopyButtons();

    document.addEventListener('partialLoaded', (e) => {
      if (e.detail && e.detail.url.includes('header.html')) {
        renderLanguageSwitcher();
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
