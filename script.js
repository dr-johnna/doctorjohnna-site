/* ============================================================
   DR. JOHNNA · doctorjohnna.com

   Minimal interactions:
     1. Mark the document as JS-available
     2. Hamburger menu toggle
     3. Scroll reveal animations (Intersection Observer)

   No frameworks. No build step. Vanilla JS only.
   ============================================================ */


/* ============================================================
   1. JS-AVAILABLE FLAG

   Add a `js` class to <html> so CSS can gate hidden-by-default
   styles (like the reveal animations) on JS being available.
   If JS fails or is disabled, content stays visible.
   ============================================================ */

document.documentElement.classList.add('js');


/* ============================================================
   2. HAMBURGER MENU
   ============================================================ */

const hamburger = document.querySelector('.hamburger');
const navDrawer = document.querySelector('.nav-drawer');

if (hamburger && navDrawer) {

  // Drop the no-JS `hidden` fallback so the class controls visibility from here on.
  navDrawer.removeAttribute('hidden');

  const closeDrawer = () => {
    navDrawer.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const openDrawer = () => {
    navDrawer.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navDrawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Close on any link click (helpful on mobile where the menu covers most of the screen).
  navDrawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer.classList.contains('is-open')) {
      closeDrawer();
      hamburger.focus();
    }
  });

  // Close on outside click.
  document.addEventListener('click', (e) => {
    if (!navDrawer.classList.contains('is-open')) return;
    if (!navDrawer.contains(e.target)) closeDrawer();
  });
}


/* ============================================================
   3. CONTACT FORM — Formspree AJAX submit + branded redirect

   Free-tier Formspree doesn't support the paid `_next` redirect
   field, so we submit via fetch() with Accept: application/json
   (which Formspree handles) and redirect on success ourselves.

   On failure or network error, we show the inline #form-error
   message inside the form. If JS is disabled, the form falls
   back to a normal POST submit and shows Formspree's default
   thank-you page — degraded but functional.
   ============================================================ */

const contactForm = document.querySelector('.contact-form');

if (contactForm) {

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById('form-error');
    if (errorBox) errorBox.hidden = true;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        window.location.href = '/thank-you.html';
        return;
      }

      // Formspree returned a non-2xx status. Show inline error.
      if (errorBox) errorBox.hidden = false;
    } catch (err) {
      if (errorBox) errorBox.hidden = false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    }
  });
}


/* ============================================================
   4. SCROLL REVEAL

   Uses Intersection Observer to add a `.revealed` class to
   elements with `.reveal` or `.reveal-children` when they
   enter the viewport. CSS handles the actual animation.

   Honors `prefers-reduced-motion`: if reduced motion is on,
   all elements are immediately revealed (no observer).
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  document.querySelectorAll('.reveal, .reveal-children').forEach((el) => {
    revealObserver.observe(el);
  });

} else {

  // Reduced motion or no IntersectionObserver: reveal everything immediately.
  document.querySelectorAll('.reveal, .reveal-children').forEach((el) => {
    el.classList.add('revealed');
  });

}
