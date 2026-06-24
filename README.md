<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

<div align="center">
  <img src="sites/main/pics/tanhio.dev.png" alt="tanhio.dev logo" width="350" height="auto" />
</div>

<h3 align="center">
  Tanhio.Dev Personal Site & Infrastructure
  <br/>
  Modern • Multihost • Dockerized
</h3>

---

This is the source code for [tanhio.dev](https://tanhio.dev) and its surrounding infrastructure. The project has evolved into a fully dockerized multihost environment powered by Node.js (Express), Caddy (for automatic HTTPS and reverse proxy), and Tailwind CSS.

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

## 📄 License

This project is licensed under the MIT License.
