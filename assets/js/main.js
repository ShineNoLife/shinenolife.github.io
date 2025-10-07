// Initialize behaviors after partials are injected
function initMenu() {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }
}
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
function initFeather() {
  if (window.feather && typeof window.feather.replace === 'function') {
    window.feather.replace();
  }
}

document.addEventListener('includes:loaded', () => {
  initMenu();
  initSmoothScroll();
  initFeather();
});
