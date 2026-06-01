import { renderGalleryGrid } from "./renderers.js";
import { icon, shuffle } from "./utils.js";

export function initSharedInteractions() {
  initMenu();
  initSmoothScroll();
  initActiveNav();
}

export function initPageInteractions(siteData, afterRender) {
  initPostFilters();
  initGalleryFilters();
  initGallery(siteData, afterRender);
}

function initMenu() {
  const btn = document.getElementById("mobile-menu-button");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"], a[href^="/home/#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.includes("#") ? href.slice(href.indexOf("#")) : href;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", targetId);

      const menu = document.getElementById("mobile-menu");
      const btn = document.getElementById("mobile-menu-button");
      menu?.classList.remove("is-open");
      btn?.setAttribute("aria-expanded", "false");
    });
  });
}

function initActiveNav() {
  const links = [...document.querySelectorAll("[data-nav-link]")];
  if (!links.length) return;

  const path = normalizePath(window.location.pathname);
  links.forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    if (rawHref.startsWith("#")) {
      link.classList.remove("is-active");
      return;
    }

    const href = normalizePath(rawHref);
    const isBlogPost = path.startsWith("/blogs/") && path !== "/blogs/" && href === "/blogs/";
    const isCurrentPage = href === path || isBlogPost;
    link.classList.toggle("is-active", isCurrentPage);
  });
}

function normalizePath(path) {
  const cleanPath = path.split("#")[0].split("?")[0];
  if (!cleanPath || cleanPath === "/") return "/home/";
  if (cleanPath.endsWith("/index.html")) return `${cleanPath.slice(0, -"index.html".length)}`;
  if (cleanPath.endsWith(".html")) return cleanPath;
  return cleanPath.endsWith("/") ? cleanPath : `${cleanPath}/`;
}

function initPostFilters() {
  const search = document.querySelector("[data-post-search]");
  const cards = [...document.querySelectorAll("[data-post-card]")];
  if (!cards.length) return;

  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();

    cards.forEach((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      card.hidden = Boolean(query && !title.includes(query));
    });
  };

  search?.addEventListener("input", apply);
}

function initGalleryFilters() {
  const tagButtons = [...document.querySelectorAll("[data-gallery-tag]")];
  const cards = [...document.querySelectorAll("[data-gallery-card]")];
  if (!cards.length) return;

  const currentTag = document.body.dataset.galleryTag || "All";
  applyGalleryFilter(currentTag);

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const activeTag = button.getAttribute("data-gallery-tag") || "All";
      document.body.dataset.galleryTag = activeTag;
      applyGalleryFilter(activeTag);
    });
  });
}

function applyGalleryFilter(activeTag = "All") {
  const cards = [...document.querySelectorAll("[data-gallery-card]")];
  const tagButtons = [...document.querySelectorAll("[data-gallery-tag]")];

  tagButtons.forEach((button) => {
    button.classList.toggle("is-active", (button.getAttribute("data-gallery-tag") || "All") === activeTag);
  });

  cards.forEach((card) => {
    const tags = (card.dataset.tags || "").split("|").filter(Boolean);
    card.hidden = activeTag !== "All" && !tags.includes(activeTag);
  });
}

function initGallery(siteData, afterRender) {
  document.addEventListener("click", (event) => {
    const item = event.target.closest("[data-gallery-item]");
    if (item) {
      openImageModal(item.dataset.src, item.dataset.title, item.dataset.caption, afterRender);
    }

    if (event.target.closest("[data-modal-close]") || event.target.matches(".modal")) {
      closeImageModal();
    }

    if (event.target.closest("[data-gallery-shuffle]")) {
      const grid = document.querySelector("[data-gallery-grid]");
      if (grid) {
        grid.innerHTML = renderGalleryGrid(shuffle(siteData.galleryImages));
        applyGalleryFilter(document.body.dataset.galleryTag || "All");
        afterRender();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeImageModal();
  });
}

function openImageModal(src, title, caption, afterRender) {
  let modal = document.querySelector("[data-image-modal]");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("data-image-modal", "");
    modal.innerHTML = `
      <button class="icon-button modal-close" type="button" data-modal-close aria-label="Close image">${icon("x")}</button>
      <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Image preview">
        <img class="modal-image" alt="">
        <div class="modal-copy">
          <h3></h3>
          <p></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalImage = modal.querySelector(".modal-image");
  modalImage.src = src;
  modalImage.alt = title || "";
  modal.querySelector(".modal-copy h3").textContent = title || "";
  modal.querySelector(".modal-copy p").textContent = caption || "";
  modal.classList.add("is-open");
  afterRender();
}

function closeImageModal() {
  document.querySelector("[data-image-modal]")?.classList.remove("is-open");
}
