const api = typeof browser !== "undefined" ? browser : chrome;

const BLOCKED_PATTERNS = [
  /youtube\.com\/shorts\//i,
  /instagram\.com\/reels\//i,
  /instagram\.com\/reel\//i,
];

let stats = { blockedCount: 0, lastBlocked: null };

api.storage.local.get(["blockedCount", "lastBlocked", "enabled"], (data) => {
  stats.blockedCount = data.blockedCount || 0;
  stats.lastBlocked = data.lastBlocked || null;
  if (data.enabled === undefined) {
    api.storage.local.set({ enabled: true });
  }
});

function isBlockedUrl(url) {
  if (!url) return false;
  return BLOCKED_PATTERNS.some((p) => p.test(url));
}

async function handleTab(tabId, url) {
  api.storage.local.get("enabled", (data) => {
    if (data.enabled === false) return;
    if (!isBlockedUrl(url)) return;

    stats.blockedCount += 1;
    stats.lastBlocked = new Date().toISOString();
    api.storage.local.set({
      blockedCount: stats.blockedCount,
      lastBlocked: stats.lastBlocked,
    });

    api.tabs.remove(tabId, () => {
      if (api.runtime.lastError) { /* tab already closed */ }
    });
  });
}

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) handleTab(tabId, changeInfo.url);
  if (changeInfo.status === "loading" && tab.url) handleTab(tabId, tab.url);
});

api.tabs.onCreated.addListener((tab) => {
  if (tab.url) handleTab(tab.id, tab.url);
  if (tab.pendingUrl) handleTab(tab.id, tab.pendingUrl);
});
