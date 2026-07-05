const express = require('express');
const path = require('node:path');
const router = express.Router();

const blogPath = __dirname;

// Serve blog-specific static files
router.use((req, res, next) => {
  if (req.path.endsWith('.mdx')) {
    res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');
  }
  next();
});

const fs = require('node:fs');

// Helper to parse YAML-like frontmatter
function parseFrontmatter(content) {
  const trimmed = (content || '').trim();
  const lines = trimmed.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== '---') {
    return { frontmatter: {}, content: trimmed };
  }
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i;
      break;
    }
  }
  if (closingIndex === -1) {
    return { frontmatter: {}, content: trimmed };
  }
  const fmLines = lines.slice(1, closingIndex);
  const body = lines.slice(closingIndex + 1).join('\n');
  const frontmatter = {};
  fmLines.forEach(line => {
    const colon = line.indexOf(':');
    if (colon !== -1) {
      const key = line.substring(0, colon).trim();
      let value = line.substring(colon + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  });
  return { frontmatter, content: body.trim() };
}

function escapeXML(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Extract first image src from MDX markdown body
function extractFirstImage(mdxContent, lang, slug) {
  // Match markdown image: ![alt](path)
  const match = mdxContent.match(/!\[.*?\]\(([^)]+)\)/);
  if (!match) return null;
  let src = match[1].trim();
  if (src.startsWith('http')) return src;
  if (!src.startsWith('/')) {
    const cleanSrc = src.replace(/^(\.\.\/|\.\/)+/, '');
    return `https://tanhio.dev/blog/${lang}/posts/${slug}/${cleanSrc}`;
  }
  return `https://tanhio.dev${src}`;
}

// Convert simple markdown to HTML for <description> content
function mdToHtml(md, lang, slug, coverImage) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/!\[(.*?)\]\(([^)]+)\)/g, (match, alt, src) => {
      let absoluteSrc = src.trim();
      if (!absoluteSrc.startsWith('http')) {
        if (absoluteSrc.startsWith('/')) {
          absoluteSrc = `https://tanhio.dev${absoluteSrc}`;
        } else {
          const cleanSrc = absoluteSrc.replace(/^(\.\.\/|\.\/)+/, '');
          absoluteSrc = `https://tanhio.dev/blog/${lang}/posts/${slug}/${cleanSrc}`;
        }
      }
      if (coverImage && absoluteSrc === coverImage) {
        return '';
      }
      return `<img src="${absoluteSrc}" alt="${escapeXML(alt)}" />`;
    })
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .split(/\n{2,}/)
    .map(p => {
      p = p.trim();
      if (!p || p.startsWith('<')) return p;
      return `<p>${p}</p>`;
    })
    .join('\n');
}

function generateRSSFeed(lang) {
  const targetLang = ['en', 'ru', 'pl'].includes(lang) ? lang : 'en';
  const postsDir = path.join(blogPath, targetLang, 'posts');
  const BASE = 'https://tanhio.dev';
  const LOGO = `${BASE}/pics/favicon-32.png`;
  const LOGO_HIGH_RES = `${BASE}/pics/apple-touch-icon.png`;
  let items = [];

  try {
    if (fs.existsSync(postsDir)) {
      const dirs = fs.readdirSync(postsDir);
      for (const dir of dirs) {
        const dirPath = path.join(postsDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          const filename = `${dir}.mdx`;
          const filePath = path.join(dirPath, filename);
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { frontmatter, content } = parseFrontmatter(fileContent);
            if (frontmatter.title) {
              // Cover image: prefer frontmatter.image, then first MDX image, then /blog/<lang>/posts/<slug>/<slug>.png
              let coverImage = null;
              if (frontmatter.image) {
                coverImage = frontmatter.image.startsWith('http')
                  ? frontmatter.image
                  : `${BASE}${frontmatter.image}`;
              } else {
                coverImage = extractFirstImage(content, targetLang, dir);
              }
              // Fallback: /blog/<lang>/posts/<slug>/<slug>.png if file exists
              if (!coverImage) {
                const fallbackPath = path.join(blogPath, targetLang, 'posts', dir, `${dir}.png`);
                if (fs.existsSync(fallbackPath)) {
                  coverImage = `${BASE}/blog/${targetLang}/posts/${dir}/${dir}.png`;
                }
              }

              items.push({
                slug: dir,
                title: frontmatter.title,
                date: frontmatter.date ? new Date(frontmatter.date) : new Date(0),
                excerpt: frontmatter.excerpt || '',
                content,
                coverImage
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error generating RSS items:', err);
  }

  // Sort newest first
  items.sort((a, b) => b.date - a.date);

  const feedTitle = 'tanhiowyatt';
  const feedDesc = lang === 'ru'
    ? 'Мысли об инженерии безопасности, пентестах и создании защищенных систем.'
    : lang === 'pl'
      ? 'Przemyślenia na temat inżynierii bezpieczeństwa, testów penetracyjnych i budowania bezpiecznych systemów.'
      : 'Thoughts on security engineering, penetration testing, and building secure systems.';

  const xmlItems = items.map(item => {
    const pubDate = item.date.toUTCString();
    const link = `${BASE}/blog/${targetLang}/${item.slug}`;
    const safeTitle = escapeXML(item.title);
    // Full HTML content wrapped in CDATA
    const htmlContent = item.coverImage
      ? `<img src="${item.coverImage}" alt="${escapeXML(item.title)}" />\n${mdToHtml(item.content, targetLang, item.slug, item.coverImage)}`
      : mdToHtml(item.content, targetLang, item.slug, item.coverImage);

    const enclosureTags = item.coverImage
      ? `\n      <enclosure url="${item.coverImage}" type="image/png" length="0" />\n      <media:content url="${item.coverImage}" medium="image" />`
      : '';

    return `
    <item>
      <title>${safeTitle}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${htmlContent}]]></description>${enclosureTags}
    </item>`;
  }).join('');

  const feedUrl = `${BASE}/blog/feed${lang === 'ru' ? '' : '.' + lang}.xml`;

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:webfeeds="http://webfeeds.org/rss/1.0/modules/status/">
<channel>
  <title>${escapeXML(feedTitle)}</title>
  <link>${BASE}/blog</link>
  <description>${escapeXML(feedDesc)}</description>
  <language>${lang === 'pl' ? 'pl' : lang === 'ru' ? 'ru' : 'en'}</language>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  <webfeeds:icon>${LOGO_HIGH_RES}</webfeeds:icon>
  <webfeeds:logo>${LOGO_HIGH_RES}</webfeeds:logo>
  <image>
    <url>${LOGO_HIGH_RES}</url>
    <title>${escapeXML(feedTitle)}</title>
    <link>${BASE}/blog</link>
  </image>
  ${xmlItems}
</channel>
</rss>`;
}

// Serve dynamic RSS feeds
router.get('/feed.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.send(generateRSSFeed('ru'));
});

router.get('/feed.en.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.send(generateRSSFeed('en'));
});

router.get('/feed.pl.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.send(generateRSSFeed('pl'));
});

// Serve blog static files
router.use(express.static(blogPath, {
  extensions: ['html', 'mdx'],
  redirect: false
}));

router.get('/', (req, res) => {
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/en' : '/blog/en');
});

router.get('/en', (req, res) => {
  res.sendFile(path.join(blogPath, 'en/index.html'));
});

router.get('/ru', (req, res) => {
  res.sendFile(path.join(blogPath, 'ru/index.html'));
});

router.get('/pl', (req, res) => {
  res.sendFile(path.join(blogPath, 'pl/index.html'));
});

// Redirect index page to /en
router.get('/index', (req, res) => {
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/en' : '/blog/en');
});

router.get('/en/index', (req, res) => {
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/en' : '/blog/en');
});

router.get('/ru/index', (req, res) => {
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/ru' : '/blog/ru');
});

router.get('/pl/index', (req, res) => {
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/pl' : '/blog/pl');
});

// Blog fallback: serve the custom 404 page if a blog route is not found
router.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../main/404.html'));
});

module.exports = router;
