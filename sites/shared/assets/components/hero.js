
'use strict';

let lastW = null;
let lastH = null;
let heroRaf = null;

function setPortraitVars() {
  const portrait = document.querySelector('.portrait');
  if (!portrait) return false;

  const rect = portrait.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);

  if (width === lastW && height === lastH) return false;

  lastW = width;
  lastH = height;

  document.documentElement.style.setProperty('--portrait-w', width + 'px');
  document.documentElement.style.setProperty('--portrait-h', height + 'px');

  const leadMax = Math.round(width * 1.6);
  document.documentElement.style.setProperty('--lead-max', leadMax + 'px');

  return true;
}

function fitsWidth(element) {
  if (!element?.parentElement) return true;
  // Use getBoundingClientRect for reliable cross-env dimension check
  return element.getBoundingClientRect().width <= element.parentElement.getBoundingClientRect().width + 1;
}

function fitToWidth(element, min, max) {
  if (!element) return false;

  let size = max;
  element.style.fontSize = size + 'px';
  let guard = 0;

  // We use the fitsWidth helper which we can mock
  while (!Hero.fitsWidth(element) && size > min && guard < 160) {
    size--;
    element.style.fontSize = size + 'px';
    guard++;
  }

  return Hero.fitsWidth(element);
}

function fitHeroCopy() {
  const box = document.querySelector('.hero-copy-box');
  const title = document.querySelector('.hero-copy');
  
  if (!box || !title) return;

  const tmin = Number.parseFloat(title.dataset.min) || 32;
  const tmax = Number.parseFloat(title.dataset.max) || 56;
  let size = tmax;
  title.style.fontSize = size + 'px';
  let guard = 0;

  // Use getBoundingClientRect logic in the loop too
  while (
    guard < 220 &&
    (title.getBoundingClientRect().width > box.getBoundingClientRect().width + 1 || 
     title.getBoundingClientRect().height > box.getBoundingClientRect().height + 1) &&
    size > tmin
  ) {
    size--;
    title.style.fontSize = size + 'px';
    guard++;
  }
}

function run() {
  Hero.setPortraitVars();
  
  const greet = document.querySelector('.hero-greet');
  if (greet) {
    const gmin = Number.parseFloat(greet.dataset.min) || 24;
    const gmax = Number.parseFloat(greet.dataset.max) || 34;
    Hero.fitToWidth(greet, gmin, gmax);
  }
  
  Hero.fitHeroCopy();
}

function scheduleRun() {
  if (heroRaf) return;
  heroRaf = globalThis.requestAnimationFrame(() => {
    heroRaf = null;
    Hero.run();
  });
}

function init() {
  if (typeof globalThis !== 'undefined') {
    globalThis.addEventListener('DOMContentLoaded', Hero.scheduleRun);
    globalThis.addEventListener('load', () => {
      if (document.fonts) {
        document.fonts.ready.then(Hero.scheduleRun).catch(Hero.scheduleRun);
      } else {
        Hero.scheduleRun();
      }
    });
    globalThis.addEventListener('resize', Hero.scheduleRun);

    if ('ResizeObserver' in globalThis) {
      const portrait = document.querySelector('.portrait');
      if (portrait) {
        new ResizeObserver(Hero.scheduleRun).observe(portrait);
      }
    }
  }
}

const Hero = {
  setPortraitVars,
  fitsWidth,
  fitToWidth,
  fitHeroCopy,
  run,
  scheduleRun,
  init
};

if (typeof document !== 'undefined' && !globalThis.__TEST__) {
  Hero.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Hero;
}
