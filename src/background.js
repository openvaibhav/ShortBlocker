const BLOCKED_PATTERNS = [
  /youtube\.com\/shorts\//i,
  /instagram\.com\/reels\//i,
  /instagram\.com\/reel\//i,
];

let stats = {
  blockedCount: 0,
  lastBlocked: null,
};

// Load stats from storage on startup
chrome.storage.local.get(["blockedCount", "lastBlocked", "enabled"], (data) => {
  stats.blockedCount = data.blockedCount || 0;
  stats.lastBlocked = data.lastBlocked || null;
  if (data.enabled === undefined) {
    chrome.storage.local.set({ enabled: true });
  }
});

function isBlockedUrl(url) {
  if (!url) return false;
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(url));
}

async function handleTab(tabId, url) {
  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === false) return;

  if (isBlockedUrl(url)) {
    stats.blockedCount += 1;
    stats.lastBlocked = new Date().toISOString();

    chrome.storage.local.set({
      blockedCount: stats.blockedCount,
      lastBlocked: stats.lastBlocked,
    });

    // Close the tab
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
      }
    });
  }
}

// Catch navigation events
chrome.webNavigation
  ? chrome.webNavigation.onBeforeNavigate?.addListener(({ tabId, url }) => {
      handleTab(tabId, url);
    })
  : null;

// Fallback: watch tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleTab(tabId, changeInfo.url);
  }
  // Also catch when tab first loads with a shorts/reels URL
  if (changeInfo.status === "loading" && tab.url) {
    handleTab(tabId, tab.url);
  }
});

// Catch newly created tabs that open directly to shorts/reels
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    handleTab(tab.id, tab.url);
  }
  // Some tabs start with pendingUrl
  if (tab.pendingUrl) {
    handleTab(tab.id, tab.pendingUrl);
  }
});
