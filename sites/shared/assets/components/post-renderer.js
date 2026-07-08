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
      const lang = getBlogLanguage();
      const slug = getPostSlug();
      const isSubpath = typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.pathname.startsWith('/blog');
      const base = isSubpath ? '/blog' : '';
      finalSrc = `${base}/${lang}/posts/${slug}/${cleanSrc}`.replace(/\/+/g, '/');
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
function updateMetadata(frontmatter, content) {
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

  let imageUrl = null;
  const lang = getBlogLanguage();
  const slug = getPostSlug();
  if (frontmatter.image) {
    imageUrl = frontmatter.image.startsWith('http') 
      ? frontmatter.image 
      : `https://tanhio.dev/blog/${lang}/posts/${slug}/${frontmatter.image}`;
  } else if (content) {
    // Extract first image from content
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const imageMatch = content.match(imageRegex);
    if (imageMatch) {
      const src = imageMatch[1];
      if (src.startsWith('http')) {
        imageUrl = src;
      } else {
        const cleanSrc = src.replace(/^(\.\.\/|\.\/)+/, '');
        imageUrl = `https://tanhio.dev/blog/${lang}/posts/${slug}/${cleanSrc}`;
      }
    }
  }

  if (imageUrl) {
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

const postTranslations = {
  en: {
    backToBlog: "Back to Blog",
    errorLoading: "Error loading post.",
    postNotFound: "Post not found."
  },
  pl: {
    backToBlog: "Powrót do bloga",
    errorLoading: "Błąd podczas ładowania wpisu.",
    postNotFound: "Nie znaleziono wpisu."
  },
  ru: {
    backToBlog: "Назад в блог",
    errorLoading: "Ошибка при загрузке поста.",
    postNotFound: "Пост не найден."
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
  
  globalThis.location.href = newPath + (globalThis.location.search || '');
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

function getPostSlug() {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const slugParam = urlParams.get('post');
  if (slugParam) return slugParam;

  const path = globalThis.location.pathname;
  const cleanPath = path.replace(/\.html$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    if (segments.includes('blog') && !['blog', 'ru', 'pl'].includes(lastSegment)) {
      return lastSegment;
    }
  }
  return null;
}

async function fetchPostContent(slug, lang) {
  const isSubpath = typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.pathname.startsWith('/blog');
  const base = isSubpath ? '/blog' : '';

  const paths = [
    `${base}/${lang}/posts/${slug}/${slug}.mdx`.replace(/\/+/g, '/'),
    `./posts/${slug}/${slug}.mdx`,
    `../posts/${slug}/${slug}.mdx`
  ];

  if (lang !== 'en') {
    paths.push(
      `${base}/en/posts/${slug}/${slug}.mdx`.replace(/\/+/g, '/'),
      `../en/posts/${slug}/${slug}.mdx`,
      `../../en/posts/${slug}/${slug}.mdx`
    );
  }

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
  const lang = getBlogLanguage();
  const t = postTranslations[lang] || postTranslations.en;

  const backLink = document.getElementById('blog-back-link');
  if (backLink) {
    const isSubpath = typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.pathname.startsWith('/blog');
    const base = isSubpath ? '/blog' : '';
    let backUrl = base + '/';
    if (lang === 'ru') backUrl = base + '/ru';
    else if (lang === 'pl') backUrl = base + '/pl';
    else if (lang === 'en') backUrl = base + '/en';
    backLink.setAttribute('href', backUrl.replace(/\/+/g, '/'));
  }

  if (!slug) {
    displayError(postContainer, t.postNotFound);
    return;
  }


  // Render language switcher
  renderLanguageSwitcher();

  try {
    const response = await fetchPostContent(slug, lang);
    if (!response) throw new Error('Not found');

    const text = await response.text();
    const { frontmatter, content } = parseFrontmatter(text);

    updateMetadata(frontmatter, content);

    if (postContainer) {
      postContainer.setAttribute('lang', frontmatter.lang || lang);
    }

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

    // Initialize RSS copy buttons on the post page
    initRSSCopyButtons();
  } catch (error) {
    console.error('Error loading post:', error);
    displayError(postContainer, t.errorLoading);
  }
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

const PostRenderer = {
  parseFrontmatter,
  markdownToHTML,
  updateMetadata,
  loadBlogPost,
  getPostSlug,
  getBlogLanguage,
  setBlogLanguage,
  renderLanguageSwitcher,
  initRSSCopyButtons,
  postTranslations
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

  document.addEventListener('partialLoaded', (e) => {
    if (e.detail && e.detail.url.includes('header.html')) {
      renderLanguageSwitcher();
    }
  });
}
