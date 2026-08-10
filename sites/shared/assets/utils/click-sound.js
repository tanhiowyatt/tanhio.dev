
'use strict';

let audio;
let lastPlay = 0;
const MIN_INTERVAL = 80; // ms

function ensureAudio() {
  if (!audio && typeof Audio !== 'undefined') {
    try {
      audio = new Audio('/assets/media/pop.mp3');
      audio.preload = 'auto';
    } catch (e) {
      console.warn('[click-sound] Failed to init audio:', e);
    }
  }
  return audio;
}

function shouldPlay() {
  const now = Date.now();
  if (now - lastPlay < MIN_INTERVAL) return false;
  lastPlay = now;
  return true;
}

function isClickableTarget(target) {
  if (!target) return false;
  const el = target.closest('button, [role="button"], a, .stretched-link, .btn-email');
  if (!el) return false;
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
    return false;
  }
  return true;
}

function playClickSound(callback) {
  let callbackCalled = false;
  const triggerCallback = () => {
    if (callback && !callbackCalled) {
      callbackCalled = true;
      callback();
    }
  };

  if (!shouldPlay()) {
    triggerCallback();
    return;
  }
  const a = ensureAudio();
  if (!a) {
    triggerCallback();
    return;
  }

  // Navigate after a standard tactile sound feedback delay (120ms),
  // ensuring we never freeze navigation if the network queue is busy.
  if (callback) {
    setTimeout(triggerCallback, 120);
  }

  try {
    a.currentTime = 0;
    const playPromise = a.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(triggerCallback).catch(triggerCallback);
    } else {
      triggerCallback();
    }
  } catch (e) {
    console.warn('[click-sound] play error:', e);
    triggerCallback();
  }
}

function init() {
  if (typeof document !== 'undefined') {
    // Pre-initialize and load the audio asset early
    ensureAudio();

    document.addEventListener(
      'click',
      function (event) {
        if (!isClickableTarget(event.target)) return;
        
        const link = event.target.closest('a');
        const isNavigationLink = link?.href && 
                               !link.hasAttribute('target') && 
                               !link.href.startsWith('mailto:') && 
                               !link.href.startsWith('tel:') &&
                               !link.href.startsWith('#') &&
                                (link.hostname === '' || (typeof globalThis !== 'undefined' && globalThis.location?.hostname === link.hostname));
        
        if (isNavigationLink) {
          event.preventDefault();
          ClickSound.playClickSound(function() {
            setTimeout(function() {
              if (typeof globalThis !== 'undefined' && globalThis.location) {
                globalThis.location.href = link.href;
              }
            }, 150);
          });
        } else {
          ClickSound.playClickSound();
        }
      },
      true
    );
  }
}

const ClickSound = { 
  playClickSound, 
  isClickableTarget, 
  shouldPlay, 
  init 
};

if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  ClickSound.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClickSound;
}
