export const icon = (name) => `<i data-feather="${name}" aria-hidden="true"></i>`;

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function externalLinkAttrs(url = "") {
  return url.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener"';
}

export function shuffle(items = []) {
  return [...items].sort(() => Math.random() - 0.5);
}
