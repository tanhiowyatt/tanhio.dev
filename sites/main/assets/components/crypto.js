

(function() {
  'use strict';

  const toast = document.getElementById('copy-toast');
  let hideTimeout = null;




  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    hideTimeout = setTimeout(() => {
      toast.classList.remove('show');
      hideTimeout = null;
    }, 1600);
  }




  function getCopyTextFrom(targetSelector) {
    const element = document.querySelector(targetSelector);
    if (!element) return '';

    const dataCopy = element.getAttribute('data-copy');
    if (dataCopy && dataCopy.trim()) {
      return dataCopy.trim();
    }

    const text = element.textContent || '';
    return text.trim();
  }




  async function copyText(text) {
    if (!text) return false;

    try {

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
    }


    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return success;
    } catch (error) {
      console.error('Copy fallback failed:', error);
      return false;
    }
  }




  async function handleCopyClick(event) {
    const button = event.target.closest('.copy-btn');
    if (!button || button.disabled) return;

    const targetSelector = button.getAttribute('data-target');
    if (!targetSelector) return;

    const text = getCopyTextFrom(targetSelector);
    if (!text) {
      showToast('No address to copy');
      return;
    }

    const success = await copyText(text);
    const label = (targetSelector || '').replace('#addr-', '').toUpperCase();
    showToast(success ? `Copied ${label || 'address'}` : 'Copy failed');
  }




  function autoDisableEmptyButtons() {
    document.querySelectorAll('.copy-btn').forEach((button) => {
      const targetSelector = button.getAttribute('data-target');
      if (!targetSelector) {
        button.disabled = true;
        return;
      }

      const element = document.querySelector(targetSelector);
      if (!element) {
        button.disabled = true;
        return;
      }

      const dataCopy = element.getAttribute('data-copy');
      const textContent = element.textContent || '';
      const text = (dataCopy || textContent).trim();

      if (!text) {
        button.disabled = true;
      }
    });
  }




  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', handleCopyClick);
        autoDisableEmptyButtons();
      });
    } else {
      document.addEventListener('click', handleCopyClick);
      autoDisableEmptyButtons();
    }
  }


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
      showToast, 
      getCopyTextFrom, 
      copyText, 
      handleCopyClick, 
      autoDisableEmptyButtons,
      init
    };
  }


  init();
})();

