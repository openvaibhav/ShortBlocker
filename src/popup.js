const api = typeof browser !== "undefined" ? browser : chrome;

const countDisplay = document.getElementById("countDisplay");
const lastBlockedEl = document.getElementById("lastBlocked");
const enableToggle = document.getElementById("enableToggle");
const toggleLabel = document.getElementById("toggleLabel");
const resetBtn = document.getElementById("resetBtn");
const statusBar = document.getElementById("statusBar");
const ytDot = document.getElementById("ytDot");
const igDot = document.getElementById("igDot");
const ytBadge = document.getElementById("ytBadge");
const igBadge = document.getElementById("igBadge");

function formatRelativeTime(isoString) {
  if (!isoString) return "No distractions blocked yet.";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "Last blocked: just now";
  if (mins < 60) return `Last blocked: ${mins}m ago`;
  if (hours < 24) return `Last blocked: ${hours}h ago`;
  return `Last blocked: ${Math.floor(hours / 24)}d ago`;
}

function setEnabledUI(enabled) {
  toggleLabel.textContent = enabled ? "ON" : "OFF";
  statusBar.classList.toggle("off", !enabled);

  const dotColor = enabled ? "red" : "";
  const badgeClass = enabled ? "platform-badge active" : "platform-badge";
  const badgeText = enabled ? "ACTIVE" : "PAUSED";

  ytDot.className = `platform-dot ${dotColor}`;
  igDot.className = `platform-dot ${dotColor}`;
  ytBadge.className = badgeClass;
  igBadge.className = badgeClass;
  ytBadge.textContent = badgeText;
  igBadge.textContent = badgeText;

  document.body.classList.toggle("disabled", !enabled);
}

// Load initial state
api.storage.local.get(["blockedCount", "lastBlocked", "enabled"], (data) => {
  const count = data.blockedCount || 0;
  const enabled = data.enabled !== false;

  countDisplay.textContent = count;
  lastBlockedEl.textContent = formatRelativeTime(data.lastBlocked);
  enableToggle.checked = enabled;
  setEnabledUI(enabled);
});

// Toggle enable/disable
enableToggle.addEventListener("change", () => {
  const enabled = enableToggle.checked;
  api.storage.local.set({ enabled });
  setEnabledUI(enabled);
});

// Reset counter
resetBtn.addEventListener("click", () => {
  api.storage.local.set({ blockedCount: 0, lastBlocked: null });
  countDisplay.textContent = "0";
  lastBlockedEl.textContent = "No distractions blocked yet.";

  // Brief flash animation
  countDisplay.style.transition = "color 0.15s";
  countDisplay.style.color = "var(--muted)";
  setTimeout(() => {
    countDisplay.style.color = "";
  }, 300);
});

// Listen for storage changes
api.storage.onChanged.addListener((changes) => {
  if (changes.blockedCount) {
    countDisplay.textContent = changes.blockedCount.newValue || 0;
  }
  if (changes.lastBlocked) {
    lastBlockedEl.textContent = formatRelativeTime(changes.lastBlocked.newValue);
  }
});
