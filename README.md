<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

<div align="center">
  <img src="sites/shared/pics/tanhio.dev.png" alt="tanhio.dev logo" width="350" height="auto" />
</div>

<h3 align="center">
  Tanhio.Dev Personal Site & Infrastructure
  <br/>
  Modern • Multihost • Dockerized
</h3>

---

This is the source code for [tanhio.dev](https://tanhio.dev) and its surrounding infrastructure. The project has evolved into a fully dockerized multihost environment powered by Node.js (Express), Caddy (for automatic HTTPS and reverse proxy), and Tailwind CSS.

<div align="center">
  <img src="sites/shared/pics/tanhio-05-08-2026.png" alt="tanhio.dev preview" width="800" height="auto" />
</div>

## 🚀 Features

- **Multihost Architecture**: A single Express server (`server.js`) designed to route traffic to the primary portfolio (`sites/main`), with built-in flexibility to scale into multiple domains or sub-sites in the future.
- **Dockerized Environment**: The entire stack is containerized. A simple `docker compose up` brings up the Node.js application and the Caddy web server.
- **Caddy Reverse Proxy**: Automatic SSL/TLS certificate provisioning and secure routing via `Caddyfile`.
- **Modern Styling**: Styled with [Tailwind CSS](https://tailwindcss.com/) for a fully responsive, mobile-first design.
- **Security & Privacy**: Strict Content Security Policy (CSP) managed by Helmet, local fonts/icons, and Cookie Consent management for Google Analytics.

## 🛠 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (if running locally without Docker)
- Make (optional, for local commands)

### Running with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tanhiowyatt/tanhio.dev.git
   cd tanhio.dev
   ```

2. **Configure Environment:**
   Ensure you have a `.env` file with your domain settings (e.g., `DOMAIN_NAME=tanhio.dev`).

3. **Start the Stack:**
   Bring up the Node.js website container and the Caddy server:
   ```bash
   docker compose --profile with-webserver up -d --build
   ```
   The site will be available at `http://localhost` (or your configured domain).

### Running Locally (Without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build Tailwind CSS:**
   ```bash
   npm run build:css
   ```
   *(To watch for CSS changes during development, use `npm run watch:css`)*

3. **Start the server:**
   ```bash
   make start
   # or
   npm start
   ```
   The site will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
├── docker-compose.yml   # Multi-container orchestration (App + Caddy)
├── Dockerfile           # Production Node.js image with automated CSS building
├── Caddyfile            # Caddy reverse proxy and HTTPS configuration
├── server.js            # Express multihost routing logic & Security (Helmet)
├── sites/               # Site-specific content
│   ├── main/            # Primary website (tanhio.dev)
│   │   ├── assets/      # JS, styles (Tailwind CSS), and modular components
│   │   ├── partials/    # HTML inclusions (Header, Footer, etc.)
│   │   └── pics/        # Images and icons

├── package.json         # NPM scripts and dependencies
└── tailwind.config.js   # Tailwind CSS configuration
```

## 🔒 Security

- **Helmet Integration**: Implements strong HTTP response headers and a robust CSP.
- **Analytics Consent**: Google Analytics is loaded conditionally only after explicit user consent via the integrated cookie banner.
- **HTTPS by Default**: Handled effortlessly in production via Caddy.

## 📝 Publishing a Blog Post

Blog posts are written in **MDX** (Markdown with YAML frontmatter), support multiple languages, and require changes to **3 files**.

### Step 1 — Create the MDX post directory and files

For a new post (e.g., `my-new-post`), create a subfolder under `sites/blog/posts/my-new-post/` and add the default and translated MDX files:

* Default/Russian: `sites/blog/posts/my-new-post/my-new-post.mdx`
* English: `sites/blog/posts/my-new-post/my-new-post.en.mdx`
* Polish: `sites/blog/posts/my-new-post/my-new-post.pl.mdx`

The files must start with a YAML frontmatter block, followed by Markdown content:

```mdx
---
title: "Your Post Title"
date: "2026-01-15"
excerpt: "A short description shown on the blog index card. Plain text only."
category: "it"
---

![Post cover image](../../images/my-new-post.png)

## Introduction

Your post content goes here in standard Markdown.
```

**Frontmatter fields:**

| Field | Required | Values | Description |
|---|---|---|---|
| `title` | ✅ | Any string | Post title shown on card and page |
| `date` | ✅ | `YYYY-MM-DD` | Publication date, used for sorting |
| `excerpt` | ✅ | Plain text | Short description for the index card |
| `category` | ✅ | `it` or `non-it` | Used for category filter on blog index |

---

### Step 2 — Create the HTML page

Copy `sites/blog/post-template.html` → `sites/blog/<slug>.html`:

```bash
cp sites/blog/post-template.html sites/blog/my-new-post.html
```

Then edit the following values in the new file (all occurrences):

| What to change | Where | Example value |
|---|---|---|
| `<title>` | `<head>` | `Your Post Title — tanhiowyatt` |
| `<link rel="canonical">` | `<head>` | `/blog/my-new-post` |
| `meta name="title"` | `<head>` | `Your Post Title — tanhiowyatt` |
| `meta name="description"` | `<head>` | Same as your `excerpt` |
| All `og:title` / `twitter:title` | `<head>` | Same as title |
| All `og:description` / `twitter:description` | `<head>` | Same as excerpt |
| All `og:url` / `twitter:url` | `<head>` | `https://tanhio.dev/blog/my-new-post/` |

The `<body>` content does **not** need to change — `post-renderer.js` automatically loads and renders the MDX file matching the current page URL and selected language.

---

### Step 3 — Register the post in `blog.js`

Open `sites/shared/assets/components/blog.js` and find the `posts` array.  
Add your new post entry **at the top** of the array (newest first):

```js
  const posts = [
    { slug: '/blog/my-new-post', file: '/blog/posts/my-new-post/my-new-post.mdx' }, // ← add here
    { slug: '/blog/industrial-ussr', file: '/blog/posts/industrial-ussr/industrial-ussr.mdx' },
    ...
```

The `slug` must match the HTML filename and the MDX subdirectory/filename (without extension).

---

### Step 4 — Add a cover image (optional)

If your post starts with an image (e.g. `![alt](../../images/my-new-post.png)`), place the image at:

```
sites/blog/images/my-new-post.png
```

Recommended size: **1200×630 px** (standard OG image ratio).

---

### Summary checklist

```
[ ] sites/blog/posts/my-new-post/my-new-post.mdx     — Russian / default version
[ ] sites/blog/posts/my-new-post/my-new-post.en.mdx  — English translation
[ ] sites/blog/posts/my-new-post/my-new-post.pl.mdx  — Polish translation
[ ] sites/blog/my-new-post.html                      — post page (copied from post-template.html, meta tags updated)
[ ] sites/shared/assets/components/blog.js           — add entry to posts[] array
[ ] sites/blog/images/my-new-post.png                — cover image (optional)
```

## 📄 License

This project is licensed under the MIT License.
