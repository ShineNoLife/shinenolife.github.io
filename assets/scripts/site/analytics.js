import { analyticsConfig } from "/analytics/config.js";

const GOOGLE_TAG_SRC = "https://www.googletagmanager.com/gtag/js";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function hasMeasurementId(measurementId) {
  return typeof measurementId === "string" && /^G-[A-Z0-9]+$/i.test(measurementId.trim());
}

function shouldTrack(config, hostname) {
  if (!config?.enabled || !hasMeasurementId(config.measurementId)) {
    return false;
  }

  if (LOCAL_HOSTS.has(hostname)) {
    return Boolean(config.trackLocalhost);
  }

  if (!Array.isArray(config.productionHosts) || config.productionHosts.length === 0) {
    return true;
  }

  return config.productionHosts.includes(hostname);
}

function appendGoogleTag(config) {
  const measurementId = config.measurementId.trim();
  const scriptSrc = `${GOOGLE_TAG_SRC}?id=${encodeURIComponent(measurementId)}`;

  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = scriptSrc;
    document.head.append(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export function initAnalytics() {
  const ga4Config = analyticsConfig.googleAnalytics;

  if (shouldTrack(ga4Config, window.location.hostname)) {
    appendGoogleTag(ga4Config);
  }
}
