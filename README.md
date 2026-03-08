# 🚫 ShortBlocker

> **Instantly kills YouTube Shorts and Instagram Reels tabs - no warnings, no second chances.**

A lightweight Chrome/Firefox browser extension that closes tabs the moment you navigate to YouTube Shorts or Instagram Reels. Built for people who want a hard stop, not a nudge.

---

## ✨ Features

- ⚡ **Instant tab closure** - closes the tab before the page even loads
- 🎯 **Covers both platforms** - YouTube Shorts + Instagram Reels/Reel
- 🔄 **SPA-aware** - catches in-app navigation (no page reload needed)
- 📊 **Blocked tab counter** - tracks how many distractions you've dodged
- 🔕 **Toggle on/off** - pause blocking without uninstalling
- 🔒 **No data collection** - everything stays local, zero network requests

---

## 📦 Installation

### Chrome / Chromium-based browsers (Edge, Brave, Arc, etc.)

1. Download or clone this repository
   ```bash
   git clone https://github.com/openvaibhav/shortblocker.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `shortblocker` folder
6. The extension icon will appear in your toolbar ✅

### Firefox

1. Open Firefox and go to `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on...**
3. Navigate to the `shortblocker` folder and select `manifest.json`
4. Done - note: temporary add-ons are removed on browser restart

> **For permanent Firefox installation / Chrome Extension Marketplace:**  Working on it.

---

## 🗂️ Project Structure

```
shortblocker/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── background.js
    ├── content.js
    ├── popup.html
    └── popup.js
```

---

## 🛠️ How It Works

ShortBlocker uses a two-layer approach to make sure no Short or Reel ever loads:

### Layer 1 - Background Service Worker (`background.js`)
- Listens to `chrome.tabs.onUpdated` and `chrome.tabs.onCreated`
- The moment a tab's URL matches a Shorts/Reels pattern, it calls `chrome.tabs.remove()`
- This catches direct links, new tab opens, and browser-level navigations

### Layer 2 - Content Script (`content.js`)
- Injected into YouTube and Instagram pages at `document_start`
- Patches `history.pushState` and `history.replaceState` to catch in-app SPA navigation
- This catches the case where you're already on YouTube and click into Shorts from the sidebar without a full page load

### URL Patterns Blocked
| Platform  |        Pattern          |
|-----------|-------------------------|
| YouTube   | `youtube.com/shorts/*`  |
| Instagram | `instagram.com/reels/*` |
| Instagram | `instagram.com/reel/*`  |

---

## 🔧 Customization

Want to add more blocked patterns? Open `src/background.js` and `src/content.js` and add to the `BLOCKED_PATTERNS` array:

```js
const BLOCKED_PATTERNS = [
  /youtube\.com\/shorts\//i,
  /instagram\.com\/reels\//i,
  /instagram\.com\/reel\//i,
  // Add your own:
  // /tiktok\.com/i,
  // /twitter\.com\/i\/status/i,
];
```

---

## 🙋 FAQ

**Q: Will this affect normal YouTube or Instagram browsing?**  
A: No. Only URLs containing `/shorts/` or `/reels/` are affected.

**Q: What if I *want* to watch a Short?**  
A: Toggle the extension off from the popup, watch your short, toggle back on. Or just... don't. That's kind of the point.

**Q: Does this send any data anywhere?**  
A: Absolutely not. All data (counter, settings) is stored locally via `chrome.storage.local`.

**Q: Why does the tab flash briefly before closing?**  
A: In some cases the background script may receive the URL slightly after the page starts loading. The content script handles this as a second layer to minimize any flash.

---

## 🤝 Contributing

Pull requests are welcome! Some ideas for contribution:

- [ ] Add TikTok support
- [ ] Daily/weekly stats dashboard
- [ ] Allowlist for specific channels
- [ ] Custom redirect URL instead of closing (e.g., redirect to a focus page)
- [ ] Firefox-compatible `.xpi` build script

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built to reclaim your attention. One closed tab at a time.
</p>
