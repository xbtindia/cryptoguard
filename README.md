# CryptoGuard — Wallet Site Firewall

A Chrome extension that blocks **all websites by default** and only allows verified official cryptocurrency wallet sites. Think of it as a firewall for your browser that protects you from phishing, fake wallet sites, and crypto scams.

## How It Works

- **Default Deny**: Every website is blocked unless explicitly allowed.
- **Built-in Allowlist**: Pre-loaded with official domains for Trezor, Ledger, MetaMask, MyEtherWallet, Exodus, Electrum, Sparrow, and more.
- **User Allowlist**: Add your own trusted sites via the popup.
- **Temp Bypass**: Need quick access? Enable a 5-minute temporary bypass.
- **Block Counter**: See how many malicious/unknown sites have been blocked.

## Built-in Allowed Sites

| Wallet / Service | Domain |
|-----------------|--------|
| Trezor | trezor.io, suite.trezor.io, wallet.trezor.io |
| Ledger | ledger.com, shop.ledger.com |
| MetaMask | metamask.io, portfolio.metamask.io |
| MyEtherWallet | myetherwallet.com |
| Exodus | exodus.com |
| Electrum | electrum.org |
| Sparrow | sparrowwallet.com |
| BlueWallet | bluewallet.io |
| Blockstream | blockstream.info |
| Mempool | mempool.space |
| GitHub | github.com (for firmware/updates) |

## Installation

### Desktop (Chrome, Edge, Brave, Opera)

1. Download and unzip this extension folder.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in top-right).
4. Click **Load unpacked**.
5. Select the `crypto-guard-extension` folder.
6. The extension is now active. Try visiting a random site — it will be blocked.

### Android (Kiwi Browser)

Chrome for Android does **not** support extensions natively. Use **Kiwi Browser** instead:

1. Install [Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser) from the Play Store.
2. Open Kiwi → tap the **3 dots** → **Extensions**.
3. Enable **Developer mode**.
4. Tap **+(from .zip/.crx/.user.js)** or **Load unpacked**.
5. Select the `crypto-guard-extension` folder (you may need to zip it first).
6. The extension will run and protect your mobile browsing.

> **Note**: On Android, the popup may appear as a full-page panel. All features work identically.

## Usage

- **Green badge** = Protected. All unknown sites are blocked.
- **Red badge** = Disabled or temp bypass active.
- Click the extension icon to:
  - View blocked count and allowed site list
  - Add new allowed domains
  - Disable/enable protection
  - Enable 5-minute temporary bypass

## Security Notes

- This extension uses Chrome's `declarativeNetRequest` API — blocking happens at the browser's network layer before any page content loads.
- No browsing data is collected or sent anywhere. Everything stays local.
- Built-in domains cannot be removed (to prevent accidental self-lockout).
- The extension can be disabled by the user at any time — it is a convenience tool, not a jail.

## Files

```
crypto-guard-extension/
├── manifest.json      # Extension manifest (MV3)
├── rules.json         # Static block/allow rules
├── background.js      # Service worker for dynamic rules
├── popup.html         # Popup UI
├── popup.css          # Popup styles (dark theme)
├── popup.js           # Popup logic
├── blocked.html       # Custom block page
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## License

MIT — Use at your own risk. This is a security tool, not financial advice.
