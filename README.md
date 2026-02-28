

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/tanhiowyatt/tanhiowyatt-site)](https://github.com/tanhiowyatt/tanhiowyatt-site/issues)

</div>

&nbsp;

<div align="center">
  <img src="pics/tanhio.dev.png" alt="tanhio.dev logo" width="150" height="auto" />
</div>

<h3 align="center">
  Tanhio.Dev Personal Site
  <br/>
  Static • Secure • Privacy-First
</h3>

<div align="center">

![HTML5 Badge](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff&style=flat-square)
![JavaScript Badge](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=flat-square)
![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff&style=flat-square)
![MDX Badge](https://img.shields.io/badge/MDX-1B1F24?logo=mdx&logoColor=fff&style=flat-square)

</div>

---





This is the source code for [tanhio.dev](https://tanhio.dev), a personal website and blog built with vanilla HTML/JS and Tailwind CSS. It is designed to be lightweight, secure, and privacy-focused.

![Screenshot](pics/tanhio-20-01-2026.png)
## Features

- **Static Architecture**: Fast and secure static HTML files.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Privacy First**: No external trackers, local fonts/icons, strict Content Security Policy (CSP).
- **Security**: 
  - SRI (Subresource Integrity) hashes for external assets (if any).
  - GPG Key distribution (`gpg.asc`).
  - `security.txt` and well-defined policies.
- **Testing**: Comprehensive test suite including Unit, E2E, Security, and Accessibility tests.

## Getting Started

### Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npx serve . -l 5173
    ```
    The site will be available at `http://localhost:5173`.

3.  **Watch Mode (CSS):**
    Recompile Tailwind CSS automatically on file changes:
    ```bash
    npm run watch:css
    ```

### Build

Compile assets for production:
```bash
npm run build:css
```

## Testing

The project maintains a comprehensive test suite in the `tests/` directory.

| Command | Description |
|:---|:---|
| `npm test` | Run all tests (Unit, E2E, Security, A11y) |
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run end-to-end browser tests |
| `npm run test:security` | Run security checks (CSP, HTTP headers) |
| `npm run test:a11y` | Run accessibility audits |

## Deployment

### Infrastructure
- **Server**: Nginx on Linux (Debian/Ubuntu)
- **Path**: `/var/www/tanhio_site`
- **Security**: Behind Cloudflare/AWS WAF, strict HTTPS, and rate limiting.

### Configuration
Production Nginx configuration is available at [`infra/nginx.conf`](./infra/nginx.conf).

**Key Features:**
- **Subdomains**: `tanhio.dev`, `blog.tanhio.dev`, `cv.tanhio.dev`
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Caching**: Aggressive caching (1 year) for static assets

### Setup Steps
1.  Clone repository to `/var/www/tanhio_site`.
2.  Install dependencies (`npm ci`) and build CSS (`npm run build:css`).
3.  Symlink and reload Nginx:
    ```bash
    sudo ln -s /var/www/tanhio_site/infra/nginx.conf /etc/nginx/sites-available/tanhio_site
    sudo ln -s /etc/nginx/sites-available/tanhio_site /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    ```

## Project Structure

```
├── assets/          # Static assets (CSS, JS, Images)
│   ├── styles/      # Tailwind input/output CSS
│   └── components/  # Modular JS components
├── blog/            # Blog posts
├── files/           # Public downloads (CV, GPG keys)
├── infra/           # Server Infrastructure (Nginx)
├── partials/        # HTML inclusions (Header, Footer)
├── tests/           # Test suites (Unit, E2E)
├── index.html       # Landing page
└── tailwind.config.js
```
