const BLOCKED_PATTERNS = [
  /youtube\.com\/shorts\//i,
  /instagram\.com\/reels\//i,
  /instagram\.com\/reel\//i,
];

const closingTabs = new Set();

function isBlocked(url) {
  if (!url) return false;
  return BLOCKED_PATTERNS.some((p) => p.test(url));
}

async function killTab(tabId, url) {
  if (!isBlocked(url)) return;
  if (closingTabs.has(tabId)) return;

  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === false) return;

  closingTabs.add(tabId);

  const { blockedCount = 0 } = await chrome.storage.local.get("blockedCount");
  await chrome.storage.local.set({
    blockedCount: blockedCount + 1,
    lastBlocked: new Date().toISOString(),
  });

  chrome.tabs.remove(tabId, () => {
    chrome.runtime.lastError;
    closingTabs.delete(tabId);
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url || (changeInfo.status === "loading" && tab.url);
  if (url) killTab(tabId, url);
});

chrome.tabs.onCreated.addListener((tab) => {
  const url = tab.url || tab.pendingUrl;
  if (url) killTab(tab.id, url);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("enabled", (data) => {
    if (data.enabled === undefined) chrome.storage.local.set({ enabled: true });
  });
});
