const BLOCKED_PATTERNS = [
  /youtube\.com\/shorts\//i,
  /instagram\.com\/reels\//i,
  /instagram\.com\/reel\//i,
];

function isBlockedUrl(url) {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(url));
}

function checkAndBlock() {
  if (isBlockedUrl(window.location.href)) {
    chrome.runtime.sendMessage({ action: "CLOSE_TAB" });
    window.stop();
    window.close();
    setTimeout(() => {
      document.documentElement.innerHTML = "";
    }, 50);
  }
}

checkAndBlock();

// Watch for SPA navigation via History API
const originalPushState = history.pushState.bind(history);
const originalReplaceState = history.replaceState.bind(history);

history.pushState = function (...args) {
  originalPushState(...args);
  checkAndBlock();
};

history.replaceState = function (...args) {
  originalReplaceState(...args);
  checkAndBlock();
};

window.addEventListener("popstate", checkAndBlock);
