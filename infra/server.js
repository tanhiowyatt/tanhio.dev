const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const vhost = require('vhost');

const app = express();
const PORT = process.env.PORT || 5173;

// Initialize CSRF protection
const csrfProtection = new csrf();

// --- SUB-APPLICATIONS ---

// 1. Main Site (tanhio.dev)
const mainApp = express();
mainApp.use(express.static(path.join(__dirname, '../sites/main'), {
  extensions: ['html']
}));
// Redirect index requests to root
mainApp.get('/index', (req, res) => res.redirect(301, '/'));

// Handle API 404s
mainApp.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

// 2. Blog (tanhio.dev/blog)
const blogApp = express();
const blogPath = path.join(__dirname, '../sites/main/blog');

// Serve shared assets even when requested relative to /blog
blogApp.use('/assets', express.static(path.join(__dirname, '../sites/main/assets')));
blogApp.use('/partials', express.static(path.join(__dirname, '../sites/main/partials')));
blogApp.use('/pics', express.static(path.join(__dirname, '../sites/main/pics')));
blogApp.use('/files', express.static(path.join(__dirname, '../sites/main/files')));

// Serve blog-specific static files
blogApp.use((req, res, next) => {
  if (req.path.endsWith('.mdx')) {
    res.setHeader('Content-Type', 'text/markdown; charset=UTF-8');
  }
  next();
});
blogApp.use(express.static(blogPath, {
  extensions: ['html', 'mdx']
}));

blogApp.get('/index', (req, res) => res.redirect(301, '/blog/'));
// Blog fallback: serve index.html for SPA-like behavior, but ONLY for non-file paths
blogApp.get('*', (req, res) => {
  // If it looks like a file (has an extension) and isn't a directory-like path, return 404 instead of index.html
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('404 - Asset Not Found');
  }
  
  res.sendFile(path.join(blogPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Blog 404 - Not Found');
  });
});

// 3. Cyanide Docs (cyanide.tanhio.dev)
const cyanideApp = express();
// Serve from 'site' directory (built by mkdocs) or 'docs' temporarily
const cyanidePath = path.join(__dirname, '../sites/cyanide/site');
cyanideApp.use('/pics', express.static(path.join(__dirname, '../sites/main/pics')));
cyanideApp.use(express.static(cyanidePath));
cyanideApp.get('*', (req, res) => {
  res.sendFile(path.join(cyanidePath, 'index.html'), (err) => {
    if (err) res.status(404).send('Docs 404 - Not Found (Make sure to run mkdocs build)');
  });
});

// --- MAIN SERVER CONFIG ---

// Parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shared static assets for ALL subdomains (keeping these for main site and absolute links)
app.use('/assets', express.static(path.join(__dirname, '../sites/main/assets')));
app.use('/partials', express.static(path.join(__dirname, '../sites/main/partials')));
app.use('/pics', express.static(path.join(__dirname, '../sites/main/pics')));
app.use('/files', express.static(path.join(__dirname, '../sites/main/files')));

// --- MOUNT BLOG SUB-APP ---
// Explicitly mount at /blog BEFORE reaching vhost routers or main app
app.use('/blog', blogApp);

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      fontSrc: ["'self'", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// CSRF protection middleware
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  let secret = req.cookies._csrf;
  if (!secret) {
    secret = csrfProtection.secretSync();
    res.cookie('_csrf', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
  }
  const token = req.body._csrf || req.headers['x-csrf-token'] || req.query._csrf;
  if (!token || !csrfProtection.verify(secret, token)) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  next();
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  let secret = req.cookies._csrf || csrfProtection.secretSync();
  if (!req.cookies._csrf) {
    res.cookie('_csrf', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });
  }
  const token = csrfProtection.create(secret);
  res.json({ csrfToken: token });
});

// --- VHOST ROUTING ---

// Production domains
app.use(vhost('tanhio.dev', mainApp));
app.use(vhost('www.tanhio.dev', mainApp));
app.use(vhost('cyanide.tanhio.dev', cyanideApp));

// Local development support
app.use(vhost('localhost', mainApp));
app.use(vhost('cyanide.localhost', cyanideApp));

// Fallback for direct IP access or unmatched hosts
app.use(mainApp);

// Start server
app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Tanhio Multihost Server running at http://localhost:${PORT}`);
  console.log(`  - Local App:    http://localhost:${PORT}`);
  console.log(`  - Blog Path:    http://localhost:${PORT}/blog`);
  console.log(`  - Cyanide Docs: http://cyanide.localhost:${PORT}`);
});

