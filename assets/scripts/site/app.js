import { siteData } from "./content.js";
import { initAnalytics } from "./analytics.js";
import { initAmbientBackground } from "./background.js";
import { loadIncludes } from "./includes.js";
import { initPageInteractions, initSharedInteractions } from "./interactions.js";
import { renderPageRegions } from "./renderers.js";

function initIcons() {
  if (window.feather && typeof window.feather.replace === "function") {
    window.feather.replace();
  }
}

function afterRender() {
  initIcons();
}

async function boot() {
  initAnalytics();
  initAmbientBackground();
  renderPageRegions(siteData);
  initPageInteractions(siteData, afterRender);
  afterRender();

  await loadIncludes();
  initSharedInteractions();
  initIcons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
