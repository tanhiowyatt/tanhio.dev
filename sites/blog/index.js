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

// Serve blog static files
router.use(express.static(blogPath, {
  extensions: ['html', 'mdx'],
  redirect: false
}));

router.get('/', (req, res) => {
  res.sendFile(path.join(blogPath, 'index.html'));
});

// Redirect index page to root
router.get('/index', (req, res) => {
  // If subdomain, redirect to /, otherwise redirect to /blog
  const isSubdomain = req.baseUrl === '';
  res.redirect(301, isSubdomain ? '/' : '/blog');
});

// Blog fallback: serve the custom 404 page if a blog route is not found
router.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../main/404.html'));
});

module.exports = router;
