const express = require('express');
const path = require('node:path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');


const app = express();
const PORT = process.env.PORT || 5173;

// Disable caching for local development
if (!process.env.VERCEL) {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
}

// Initialize CSRF protection
const csrfProtection = new csrf();

// --- DYNAMIC SUB-APPLICATIONS LOADER ---
const fs = require('node:fs');
const sitesDir = path.join(__dirname, 'sites');
const sites = {};

// Scan the sites directory and load sites dynamically
fs.readdirSync(sitesDir).forEach(dir => {
  const dirPath = path.join(sitesDir, dir);
  if (fs.statSync(dirPath).isDirectory()) {
    if (dir === 'shared') return; // Skip shared resources folder
    
    // Check if site has a custom router/app
    const routerPath = path.join(dirPath, 'index.js');
    if (fs.existsSync(routerPath)) {
      sites[dir] = require(routerPath);
    } else {
      // Default static router for static sites
      const staticRouter = express.Router();
      
      // Serve static assets for the site
      staticRouter.use(express.static(dirPath, {
        extensions: ['html'],
        redirect: false
      }));
      
      // Serve root index.html
      staticRouter.get('/', (req, res) => {
        res.sendFile(path.join(dirPath, 'index.html'));
      });
      
      // Redirect index requests to root
      staticRouter.get('/index', (req, res) => res.redirect(301, '/'));
      
      // Special handling for api 404s on the main site
      if (dir === 'main') {
        staticRouter.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));
      }
      
      // Fallback 404
      staticRouter.get('*', (req, res) => {
        res.status(404).sendFile(path.join(sitesDir, 'main/404.html'));
      });
      
      sites[dir] = staticRouter;
    }
  }
});

const mainApp = sites['main'];



// --- MAIN SERVER CONFIG ---

// Parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect trailing slashes globally (except for root /)
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    const cleanPath = req.path.slice(0, -1);
    res.redirect(301, cleanPath + query);
  } else {
    next();
  }
});

// Shared static assets for ALL subdomains & sites
app.use('/assets', express.static(path.join(__dirname, './sites/shared/assets')));
app.use('/partials', express.static(path.join(__dirname, './sites/shared/partials')));
app.use('/pics', express.static(path.join(__dirname, './sites/shared/pics')));
app.use('/files', express.static(path.join(__dirname, './sites/shared/files')));

// Serve root-level favicons & apple-touch-icons (required for RSS readers and web browsers)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, './sites/shared/pics/favicon.ico'));
});
app.get('/apple-touch-icon.png', (req, res) => {
  res.sendFile(path.join(__dirname, './sites/shared/pics/apple-touch-icon.png'));
});
app.get('/apple-touch-icon-precomposed.png', (req, res) => {
  res.sendFile(path.join(__dirname, './sites/shared/pics/apple-touch-icon.png'));
});

// --- MOUNT SUB-APPS (SUBPATH ROUTING FOR BACKWARD COMPATIBILITY) ---
if (sites['blog']) {
  app.use('/blog', sites['blog']);
}

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      styleSrc: ["'self'", "https://unpkg.com"],
      fontSrc: ["'self'", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://vitals.vercel-insights.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: null
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

// --- DYNAMIC HOST ROUTING ---
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const cleanHost = host.split(':')[0].toLowerCase();
  
  const prodDomain = 'tanhio.dev';
  
  // Extract subdomain if matching the domain format
  let subdomain = null;
  if (cleanHost.endsWith(`.${prodDomain}`)) {
    subdomain = cleanHost.slice(0, -(prodDomain.length + 1));
  } else if (cleanHost.endsWith('.localhost')) {
    subdomain = cleanHost.slice(0, -('.localhost'.length));
  }
  
  // Route to the corresponding subdomain site if it exists (excluding www and blog)
  if (subdomain && subdomain !== 'www' && subdomain !== 'blog' && sites[subdomain]) {
    return sites[subdomain](req, res, next);
  }
  
  // Default fallback (tanhio.dev, www.tanhio.dev, localhost, etc.)
  return mainApp(req, res, next);
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Start server locally if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[36m%s\x1b[0m`, `🚀 Tanhio Multihost Server running at http://0.0.0.0:${PORT}`);
    console.log(`  - Local App:    http://0.0.0.0:${PORT}`);
    console.log(`  - Blog Path:    http://0.0.0.0:${PORT}/blog`);
  });
}

