import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

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
      yPercent: 115, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: instant ? 0.15 : 0,
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
  document.querySelectorAll<HTMLElement>('[data-scale-in]').forEach((el) => {
    gsap.fromTo(el, { scale: 0.86, borderRadius: '48px' }, { scale: 1, borderRadius: '24px', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: true } });
  });
}

function initHorizontal() {
  const mm = gsap.matchMedia();
  // Pin only when the whole section fits on screen and there is real overflow to scroll through.
  mm.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      const clip = track?.parentElement;
      if (!track || !clip) return;
      const dist = () => Math.max(0, track.scrollWidth - clip.clientWidth);
      if (dist() < 120 || section.offsetHeight > window.innerHeight) return;
      clip.style.overflow = 'hidden';
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'center center', end: () => '+=' + dist(),
          scrub: 1, pin: true, invalidateOnRefresh: true,
        },
      });
      return () => { clip.style.overflow = ''; };
    });
  });
  cleanups.push(() => mm.revert());
}

function initTilt() {
  if (!fine() || reduce()) return;
  document.querySelectorAll<HTMLElement>('.tilt').forEach((el) => {
    const max = parseFloat(el.dataset.tilt || '10');
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
    };
    const leave = () => { el.classList.remove('is-tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
  });
}

function initMagnetic() {
  if (!fine() || reduce()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35); yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

function initCursor() {
  const c = document.querySelector<HTMLElement>('.cursor');
  if (!c || !fine() || reduce()) return;
  const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  const move = (e: PointerEvent) => { c.classList.add('on'); xTo(e.clientX); yTo(e.clientY); };
  const over = (e: Event) => c.classList.toggle('big', !!(e.target as HTMLElement).closest('a, button, .tilt'));
  window.addEventListener('pointermove', move); document.addEventListener('pointerover', over);
  cleanups.push(() => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); });
}

async function initHero3D() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero3d]');
  if (!canvas) return;
  const { mountHero } = await import('./hero3d');
  disposeHero = mountHero(canvas, reduce());
}

function init() {
  document.documentElement.classList.add('js');
  initSmoothScroll();
  initText();
  initScrubWords();
  initReveals();
  initParallax();
  initHorizontal();
  initTilt();
  initMagnetic();
  initCursor();
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
