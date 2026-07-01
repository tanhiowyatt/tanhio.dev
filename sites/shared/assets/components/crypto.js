
'use strict';

let toast = null;
let hideTimeout = null;

function showToast(message) {
  if (!toast) toast = document.getElementById('copy-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
    hideTimeout = null;
  }, 2000);
}

function getCopyTextFrom(selector) {
  const target = document.querySelector(selector);
  if (!target) return null;
  return target.textContent.trim();
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
      return true;
    }
    throw new Error('Clipboard API unavailable');
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Failed to copy');
    return false;
  }
}

async function handleCopyClick(event) {
  const button = event.target.closest('.copy-btn');
  if (!button || button.disabled) return;

  const targetSelector = button.dataset.target;
  if (!targetSelector) return;

  const text = getCopyTextFrom(targetSelector);
  if (!text) {
    showToast('No address to copy');
    return;
  }

  const success = await copyText(text);

  if (success) {
    const label = (targetSelector || '').replace('#addr-', '').toUpperCase();
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check-lg"></i> ' + label;
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 2000);
  }
}

function init() {
  toast = document.getElementById('copy-toast');
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(button => {
    button.onclick = handleCopyClick;
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleCopyClick, copyText, getCopyTextFrom, showToast, init };
}
