import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let cleanups: Array<() => void> = [];
let disposeHero: (() => void) | null = null;

function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent || '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = part; w.appendChild(i); frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  };
  walk(el);
  el.classList.add('split');
  el.dataset.splitDone = '1';
}

function initSmoothScroll() {
  if (reduce()) return;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; });
}

function initText() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    splitWords(el);
    if (reduce()) return;
    const words = el.querySelectorAll('.w > span');
    const instant = el.dataset.split === 'load';
    gsap.from(words, {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: instant ? 0.15 : 0,
      scrollTrigger: instant ? undefined : { trigger: el, start: 'top 85%' },
    });
  });
}

function initScrubWords() {
  document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    splitWords(el);
    el.classList.remove('split');
    if (reduce()) return;
    const words = el.querySelectorAll('.w > span');
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
    });
  });
}

function initReveals() {
  const els = gsap.utils.toArray<HTMLElement>('.reveal');
  if (reduce()) { els.forEach((e) => e.classList.add('in')); return; }
  ScrollTrigger.batch(els, {
    start: 'top 88%',
    onEnter: (batch) => batch.forEach((e, i) => setTimeout(() => e.classList.add('in'), i * 110)),
  });
}

function initParallax() {
  if (reduce()) return;
  document.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '0.2');
    gsap.to(el, { yPercent: -100 * speed, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Rules draw in from the left as their section arrives.
  document.querySelectorAll<HTMLElement>('.marker').forEach((el) => {
    gsap.fromTo(el, { '--rule-w': '0%' }, { '--rule-w': '100%', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function initHero3D() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero3d]');
  if (!canvas) return;
  // Without WebGL (old devices, some locked-down browsers) show a static drawing of the same sheet.
  const fallback = () => canvas.classList.add('is-static');
  if (!hasWebGL()) return fallback();
  try {
    const { mountHero } = await import('./hero3d');
    disposeHero = mountHero(canvas, reduce());
  } catch {
    fallback();
  }
}

function init() {
  document.documentElement.classList.add('js');
  initSmoothScroll();
  initText();
  initScrubWords();
  initReveals();
  initParallax();
  initHero3D();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

function destroy() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  cleanups.forEach((fn) => fn()); cleanups = [];
  disposeHero?.(); disposeHero = null;
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', destroy);
