import { analyticsConfig } from "/analytics/config.js";

const CLOUDFLARE_BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function hasToken(token) {
  return typeof token === "string" && token.trim().length > 0;
}

function shouldTrack(config, hostname) {
  if (!config?.enabled || !hasToken(config.token)) {
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

function appendCloudflareBeacon(config) {
  if (document.querySelector(`script[src="${CLOUDFLARE_BEACON_SRC}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = CLOUDFLARE_BEACON_SRC;
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: config.token.trim() }));
  document.head.append(script);
}

export function initAnalytics() {
  const cloudflareConfig = analyticsConfig.cloudflareWebAnalytics;

  if (shouldTrack(cloudflareConfig, window.location.hostname)) {
    appendCloudflareBeacon(cloudflareConfig);
  }
}
