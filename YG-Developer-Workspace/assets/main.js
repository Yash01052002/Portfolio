(() => {
  const nav = document.querySelector('.primary-nav');
  const menu = document.querySelector('.menu-toggle');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 45px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('visible'));
  const copyButton = document.querySelector('.copy-email');
  const toast = document.querySelector('.toast');
  let toastTimeout;
  if (copyButton) copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.copy;
    try {
      await navigator.clipboard.writeText(email);
      if (toast) {
        toast.textContent = 'Email address copied';
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
      }
    } catch (err) {
      // Some browsers restrict Clipboard API on local files or without HTTPS.
      // Fall back to a temporary input rather than triggering an unconfigured mail app.
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* use manual fallback */ }
      field.remove();
      if (copied) {
        if (toast) {
          toast.textContent = 'Email address copied';
          toast.classList.add('show');
          clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
        }
      } else {
        window.prompt('Copy email address:', email);
      }
    }
  });
})();
