import { escapeHtml, externalLinkAttrs, icon, shuffle } from "./utils.js";

export function renderPageRegions(siteData) {
  document.querySelectorAll("[data-render]").forEach((node) => {
    const renderer = renderers[node.dataset.render];
    if (renderer) renderer(node, siteData);
  });
}

export function renderGalleryGrid(items) {
  return `
    <div class="gallery-grid">
      ${items.map((item, index) => {
        const tags = item.tags || [];
        return `
        <button class="gallery-item ${index % 7 === 0 ? "large" : ""} ${index % 5 === 0 ? "tall" : ""}" type="button" data-gallery-item data-gallery-card data-tags="${escapeHtml(tags.join("|"))}" data-src="${escapeHtml(item.src)}" data-title="${escapeHtml(item.title)}" data-caption="${escapeHtml(item.caption)}">
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}">
          <span class="gallery-caption">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="gallery-caption-text">${escapeHtml(item.caption)}</span>
            ${tags.length ? `
              <span class="tag-row gallery-tag-row" aria-label="Image tags">
                ${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
              </span>
            ` : ""}
          </span>
        </button>
      `;
      }).join("")}
    </div>
  `;
}

const renderers = {
  home: renderHome,
  publications: renderPublications,
  "writing-list": renderWritingList,
  "gallery-list": renderGalleryList
};

function renderHome(node, { profile }) {
  node.innerHTML = `
    <div class="hero-grid">
      <aside class="profile-panel" aria-label="Profile image">
        <div class="portrait-frame">
          <img src="${escapeHtml(profile.image)}" alt="${escapeHtml(profile.name)}">
        </div>
        ${renderProfileFacts(profile)}
      </aside>
      <div class="hero-copy">
        <h1 class="hero-title">${escapeHtml(profile.name)}</h1>
        <p class="hero-subtitle">${escapeHtml(profile.title)}</p>
        ${profile.intro.map((line) => `<p class="hero-intro">${escapeHtml(line)}</p>`).join("")}
        <div class="hero-actions">
          <a class="button primary" href="${escapeHtml(profile.cv)}" download>${icon("download")} Download CV</a>
          <a class="button" href="#publications">${icon("book")} Publications</a>
        </div>
        <div class="social-row" aria-label="Social links">
          ${profile.socials.map((social) => `
            <a class="icon-button" href="${escapeHtml(social.url)}" ${externalLinkAttrs(social.url)} aria-label="${escapeHtml(social.label)}">
              ${icon(social.icon)}
            </a>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderProfileFacts(profile) {
  const facts = [
    profile.location ? `<div class="fact-line">${icon("map-pin")}<span>${escapeHtml(profile.location)}</span></div>` : "",
    profile.institution ? `<div class="fact-line">${icon("home")}<span>${escapeHtml(profile.institution)}</span></div>` : "",
    profile.email ? `<a class="fact-line" href="mailto:${escapeHtml(profile.email)}">${icon("mail")}<span>${escapeHtml(profile.email)}</span></a>` : ""
  ].filter(Boolean).join("");

  return facts ? `<div class="profile-facts">${facts}</div>` : "";
}

function renderPublications(node, { publications }) {
  const publicationMarkup = publications.length
    ? publications.map(renderPublication).join("")
    : `
      <div class="empty-panel">
        <p class="card-kicker">Publications</p>
        <h3>No publications listed yet</h3>
      </div>
    `;

  node.innerHTML = `
    ${sectionHeading("", "Publications", "")}
    <div class="publication-list single-column">
      ${publicationMarkup}
    </div>
  `;
}

function renderPublication(paper) {
  return `
    <article class="page-card">
      <div class="publication-copy">
        <p class="publication-meta">${escapeHtml(paper.year || "")}</p>
        <h3>${escapeHtml(paper.title)}</h3>
        ${paper.authors ? `<p>${escapeHtml(paper.authors)}</p>` : ""}
        ${paper.venue ? `<p>${escapeHtml(paper.venue)}</p>` : ""}
        ${paper.url ? `<a class="read-more" href="${escapeHtml(paper.url)}" target="_blank" rel="noopener">Open ${icon("external-link")}</a>` : ""}
      </div>
    </article>
  `;
}

function renderWritingList(node, { posts }) {
  node.innerHTML = `
    <div class="post-controls">
      <input class="search-input" type="search" placeholder="Search by title" data-post-search>
    </div>
    <div class="post-grid" data-post-list>
      ${posts.map(renderPostCard).join("")}
    </div>
  `;
}

function renderPostCard(post) {
  return `
    <a class="post-card" href="${escapeHtml(post.url)}" data-post-card data-title="${escapeHtml(post.title)}">
      <div class="post-card-image">
        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">
      </div>
      <div class="post-card-body">
        <p class="post-meta">${escapeHtml(post.category)}</p>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
        <div class="tag-row">
          ${(post.tags || []).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </a>
  `;
}

function renderGalleryList(node, { galleryImages }) {
  const tags = [...new Set(galleryImages.flatMap((image) => image.tags || []))];
  const galleryMarkup = galleryImages.length
    ? `
      <div class="gallery-toolbar">
        <div class="gallery-controls" aria-label="Gallery filters">
          <button class="filter-button is-active" type="button" data-gallery-tag="All">All</button>
          ${tags.map((tag) => `<button class="filter-button" type="button" data-gallery-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}
        </div>
        <div class="section-actions gallery-actions">
          <button class="button" type="button" data-gallery-shuffle>${icon("shuffle")} Shuffle</button>
        </div>
      </div>
      <div data-gallery-grid>
        ${renderGalleryGrid(shuffle(galleryImages))}
      </div>
    `
    : `
      <div class="empty-panel">
        <p class="card-kicker">Gallery</p>
        <h3>No gallery images yet</h3>
      </div>
    `;

  node.innerHTML = `
    ${galleryMarkup}
  `;
}

function sectionHeading(kicker, title, body, action = "") {
  return `
    <div class="section-heading">
      <div>
        ${kicker ? `<p class="section-kicker">${escapeHtml(kicker)}</p>` : ""}
        <h2>${escapeHtml(title)}</h2>
        ${body ? `<p>${escapeHtml(body)}</p>` : ""}
      </div>
      ${action ? `<div class="section-actions">${action}</div>` : ""}
    </div>
  `;
}
