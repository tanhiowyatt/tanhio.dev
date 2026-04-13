

(function () {
  'use strict';


  function sanitizeHTML(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return doc.body;
    } catch (e) {
      console.warn('HTML parsing failed, using text fallback:', e);
      const div = document.createElement('div');
      div.textContent = html;
      return div;
    }
  }


  async function loadIncludes() {
    const includeNodes = document.querySelectorAll('[data-include]');

    if (includeNodes.length === 0) return;

    const promises = Array.from(includeNodes).map(async (node) => {
      const url = node.getAttribute('data-include');
      if (!url) return;

      try {
        const response = await fetch(url, {
          cache: 'no-cache',
          credentials: 'same-origin'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const sanitized = sanitizeHTML(html);


        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }

        while (sanitized.firstChild) {
          node.appendChild(sanitized.firstChild);
        }


        node.removeAttribute('data-include');
      } catch (error) {
        console.warn('Include failed for', url, error);
        node.textContent = 'Content could not be loaded.';
        node.classList.add('include-error');
      }
    });

    await Promise.all(promises);

    document.dispatchEvent(new CustomEvent('includesLoaded', {
      bubbles: true,
      cancelable: true
    }));

    window.dispatchEvent(new CustomEvent('includesLoaded', {
      bubbles: true,
      cancelable: true
    }));
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIncludes);
  } else {
    loadIncludes();
  }


  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;


    if (
      href.startsWith('http') &&
      !href.includes(window.location.hostname)
    ) return;


    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.hasAttribute('target') && link.getAttribute('target') === '_blank'
    ) return;


    if (
      href.endsWith('.pdf') ||
      href.endsWith('.zip') ||
      href.endsWith('.asc')
    ) return;

    e.preventDefault();
    document.body.classList.add('fade-out');

    setTimeout(() => {
      window.location.href = href;
    }, 250);
  });
})();

