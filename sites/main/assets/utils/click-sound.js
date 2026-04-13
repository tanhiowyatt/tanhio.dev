/**
 * Global click sound handler
 * Plays pop.mp3 on button / clickable element interactions
 */

(function () {
  'use strict';

  var audio;
  var lastPlay = 0;
  var MIN_INTERVAL = 80; // ms – небольшая защита от спама

  function ensureAudio() {
    if (!audio) {
      try {
        // Use path to media folder
        audio = new Audio('/assets/media/pop.mp3');
        audio.preload = 'auto';
      } catch (e) {
        console.warn('[click-sound] Failed to init audio:', e);
      }
    }
    return audio;
  }

  function shouldPlay() {
    var now = Date.now();
    if (now - lastPlay < MIN_INTERVAL) return false;
    lastPlay = now;
    return true;
  }

  function isClickableTarget(target) {
    if (!target) return false;
    var el = target.closest('button, [role="button"], a, .stretched-link, .btn-email');
    if (!el) return false;
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    return true;
  }

  function playClickSound(callback) {
    if (!shouldPlay()) {
      if (callback) callback();
      return;
    }
    var a = ensureAudio();
    if (!a) {
      if (callback) callback();
      return;
    }

    try {
      a.currentTime = 0;
      var playPromise = a.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function() {
          // Sound started playing
          if (callback) callback();
        }).catch(function () {
          // Игнорируем – браузер может блокировать но это не критично
          if (callback) callback();
        });
      } else {
        // Fallback for browsers that don't return a promise
        if (callback) setTimeout(callback, 10);
      }
    } catch (e) {
      // Безопасно глушим любые ошибки, чтобы не ломать UX
      console.warn('[click-sound] play error:', e);
      if (callback) callback();
    }
  }

  document.addEventListener(
    'click',
    function (event) {
      if (!isClickableTarget(event.target)) return;
      
      // Check if this is a navigation link (same-origin link, not external)
      var link = event.target.closest('a');
      var isNavigationLink = link && 
                             link.href && 
                             !link.hasAttribute('target') && 
                             !link.href.startsWith('mailto:') && 
                             !link.href.startsWith('tel:') &&
                             !link.href.startsWith('#') &&
                             (link.hostname === '' || link.hostname === window.location.hostname);
      
      if (isNavigationLink) {
        // For navigation links, prevent default, play sound, then navigate
        event.preventDefault();
        playClickSound(function() {
          // Wait a bit longer after sound starts to let it play
          setTimeout(function() {
            window.location.href = link.href;
          }, 150);
        });
      } else {
        // For other clickable elements, just play sound
        playClickSound();
      }
    },
    true // capture, чтобы поймать до остановки всплытия
  );
})();


