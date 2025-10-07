// Minimal client-side include loader: replaces any element with [data-include="/path/file.html"] with the fetched HTML.
document.addEventListener('DOMContentLoaded', async () => {
  const nodes = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(nodes.map(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (e) {
      el.outerHTML = `<!-- include failed: ${url} (${e.message}) -->`;
    }
  }));
  document.dispatchEvent(new Event('includes:loaded'));
});
