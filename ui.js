/* Small, dependency-free UI polish layer. Keeps the site fast on phones. */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('ui-ready');
    makeNavigationUsable();
    lazyLoadMedia();
    addRevealAnimations();
    addPageTransitions();
  });

  function makeNavigationUsable() {
    const nav = document.querySelector('.floaty-nav');
    const active = nav && nav.querySelector('.nav-pill.active');
    if (active && window.innerWidth < 720) {
      requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest', inline: 'center' }));
    }
  }

  function lazyLoadMedia() {
    document.querySelectorAll('img:not([loading])').forEach((image) => {
      if (!image.closest('.birthday-poster')) image.loading = 'lazy';
      image.decoding = 'async';
    });
  }

  function addRevealAnimations() {
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll(
      '.big-card, .mini-section, .watch-card, .poster-card, .wish-card, .photo-card, .rakhi-banner, .hero-banner, .game-card, .pet-card, .camera-wrap'
    );
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px' });
    targets.forEach((target, index) => {
      target.classList.add('reveal');
      target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
      observer.observe(target);
    });
  }

  function addPageTransitions() {
    if (reducedMotion) return;
    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        document.body.classList.add('page-leaving');
        window.setTimeout(() => { window.location.href = href; }, 150);
      });
    });
  }
})();
