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

export function renderNativeImage(image, options = {}) {
  const data = normalizeImage(image);
  const {
    alt = data.alt || "",
    className = "",
    loading = "lazy",
    decoding = "async",
    fetchPriority = "",
    width = data.width,
    height = data.height
  } = options;

  if (!data.src) return "";

  const attrs = [
    `src="${escapeHtml(data.src)}"`,
    `alt="${escapeHtml(alt)}"`,
    width ? `width="${escapeHtml(width)}"` : "",
    height ? `height="${escapeHtml(height)}"` : "",
    loading ? `loading="${escapeHtml(loading)}"` : "",
    decoding ? `decoding="${escapeHtml(decoding)}"` : "",
    fetchPriority ? `fetchpriority="${escapeHtml(fetchPriority)}"` : "",
    className ? `class="${escapeHtml(className)}"` : ""
  ].filter(Boolean).join(" ");

  return `<img ${attrs}>`;
}

function normalizeImage(image) {
  return typeof image === "string" ? { src: image } : image || {};
}
