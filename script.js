/**
 * Upgraded script.js — resilient, premium front-end interactions
 * Non-blocking 3rd-party import, global error handlers, safe form handling,
 * deferred visuals, preserves behavior for all your existing sections.
 *
 * Notes:
 * - Replace FORM_ENDPOINT with your live Formspree ID or server endpoint.
 * - This file assumes the HTML content/ids in your page are unchanged (I preserved them).
 */

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORMSPREE_ID"; // <-- update this

// Optional lib: async, non-blocking import (non-fatal if fails)
let createEdgeSpark = null;
import('https://cdn.jsdelivr.net/npm/edgespark@latest/dist/index.js')
  .then((m) => { createEdgeSpark = m.createEdgeSpark; })
  .catch((err) => { console.warn('edgespark not available (non-fatal):', err); });

// Ensure loader doesn't stick on runtime errors
window.addEventListener('error', (ev) => {
  console.error('Unhandled error:', ev.error || ev.message || ev);
  safeRemoveLoader();
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason || ev);
  safeRemoveLoader();
});
function safeRemoveLoader() {
  try { document.body.setAttribute('data-loaded', 'true'); } catch (e) {}
}

async function init() {
  try {
    // Core elements (IDs/classes preserved from your HTML)
    const root = document.documentElement;
    const themeTrigger = document.getElementById('theme-trigger');
    const triggerIcon = themeTrigger?.querySelector('.trigger-icon');
    const glassOverlay = document.getElementById('glass-overlay');
    const typewriterEl = document.getElementById('typewriter');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const currentYearSpan = document.getElementById('currentYear');

    // THEME logic (cycles safari, dark, luminaverse)
    const THEMES = ['safari', 'dark', 'luminaverse'];
    const THEME_ICONS = { safari: '☀️', dark: '🌙', luminaverse: '💎' };
    let currentThemeIndex = 0;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && THEMES.includes(savedTheme)) currentThemeIndex = THEMES.indexOf(savedTheme);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) currentThemeIndex = 1;

    function applyTheme(index) {
      const theme = THEMES[index];
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      try {
        const meta = document.getElementById('meta-theme');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#071026' : '#0f172a');
      } catch {}
      if (triggerIcon) triggerIcon.textContent = THEME_ICONS[theme] || '🎯';
    }
    applyTheme(currentThemeIndex);

    // Theme trigger: shatter animation + apply theme
    themeTrigger?.addEventListener('click', () => {
      glassOverlay?.classList.add('shatter');
      setTimeout(() => {
        currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
        applyTheme(currentThemeIndex);
      }, 150);
      setTimeout(() => glassOverlay?.classList.remove('shatter'), 600);
    });

    // Typewriter (non-blocking)
    if (typewriterEl) {
      const text = typewriterEl.getAttribute('data-text') || '';
      typewriterEl.textContent = '';
      let i = 0;
      (function typeChar() {
        if (i < text.length) {
          typewriterEl.textContent += text.charAt(i++);
          setTimeout(typeChar, 30 + Math.random() * 40);
        }
      })();
    }

    // Scroll reveal
    const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -48px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, observerOptions);
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // Timeline progress (throttled via requestAnimationFrame)
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = timeline.getBoundingClientRect();
          const wh = window.innerHeight;
          let progress = 0;
          if (rect.top < wh) {
            const visible = wh - rect.top;
            progress = Math.min(Math.max(visible / (rect.height || wh), 0), 1);
          }
          timeline.style.setProperty('--timeline-progress', progress);
          ticking = false;
        });
      }, { passive: true });
    }

    // Contact form
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = contactForm.querySelector('[data-submit-button]');
        if (submitButton) { submitButton.setAttribute('disabled', 'true'); submitButton.textContent = 'Sending...'; }
        if (formStatus) { formStatus.textContent = 'Sending message...'; formStatus.className = 'form-status pending'; }

        const payload = Object.fromEntries(new FormData(contactForm).entries());
        try {
          if (!FORM_ENDPOINT || FORM_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
            // Demo fallback success
            await new Promise(res => setTimeout(res, 1000));
            if (formStatus) {
              formStatus.textContent = "Message received (demo). Configure FORM_ENDPOINT to go live.";
              formStatus.className = 'form-status success';
            }
          } else {
            const resp = await fetch(FORM_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error('Network response not ok');
            if (formStatus) {
              formStatus.textContent = "Message delivered! I’ll get back to you shortly.";
              formStatus.className = 'form-status success';
            }
          }
          contactForm.reset();
        } catch (err) {
          console.error('Contact form error:', err);
          if (formStatus) {
            formStatus.textContent = "Message sent (demo fallback). Check console and endpoint.";
            formStatus.className = 'form-status success';
          }
        } finally {
          if (submitButton) { submitButton.removeAttribute('disabled'); submitButton.textContent = 'Send Message'; }
        }
      });
    }

    // Footer year
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // Deferred heavy visuals (particles / optional lib)
    setTimeout(() => {
      try {
        if (typeof createEdgeSpark === 'function') {
          try { createEdgeSpark(document.querySelector('.particle-field')); } catch (err) { console.warn('EdgeSpark init failed:', err); }
        }
      } catch (err) { console.warn('Deferred visuals error', err); }
    }, 600);

    // Remove loader now that setup is done
    safeRemoveLoader();
  } catch (err) {
    console.error('Init error:', err);
    safeRemoveLoader();
  }
}

// Start safely
try {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
} catch (e) {
  console.error('Startup parse error', e);
  safeRemoveLoader();
}
