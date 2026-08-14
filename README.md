# CryptoGuard — Wallet Site Firewall

> A browser extension that temporarily blocks all websites except verified crypto wallet sites. Think of it as a **panic button for your browser** — activate it when you're managing crypto, and it auto-disables when you're done.

---

## Why CryptoGuard?

Crypto phishing is a **$10B+ problem**. Scammers create fake wallet sites that look identical to the real ones. One wrong click and your assets are gone.

CryptoGuard solves this with a **dead-simple idea**:

- Browse normally by default
- Tap a timer to enter **Safe Mode** when doing crypto
- Only official wallet sites load; everything else is blocked
- Timer expires → back to normal browsing automatically

No blocklists to maintain. No AI to trust. Just a hard allowlist of verified domains.

---

## Features

| Feature | Description |
|---------|-------------|
| **Safe Mode Timer** | Activate blocking for 5/15/30/60 minutes or custom duration |
| **Auto-Disable** | Protection turns off automatically when timer expires |
| **Default Allow** | Normal browsing is never interrupted — only lock down when you need it |
| **Built-in Allowlist** | Pre-loaded with Trezor, Ledger, MetaMask, Exodus, Electrum, Sparrow, and more |
| **User Allowlist** | Add your own trusted sites (e.g. block explorers, DEXs) |
| **Block Counter** | See how many scam/unknown sites were stopped |
| **Zero Data Collection** | No analytics, no telemetry, no remote servers — everything stays local |
| **Open Source** | Fully auditable code. No hidden scripts or external dependencies |

---

## Built-in Allowed Sites

| Service | Domains |
|---------|---------|
| **Trezor** | `trezor.io`, `suite.trezor.io`, `wallet.trezor.io` |
| **Ledger** | `ledger.com`, `shop.ledger.com` |
| **MetaMask** | `metamask.io`, `portfolio.metamask.io` |
| **MyEtherWallet** | `myetherwallet.com` |
| **Exodus** | `exodus.com` |
| **Electrum** | `electrum.org` |
| **Sparrow** | `sparrowwallet.com` |
| **BlueWallet** | `bluewallet.io` |
| **Blockstream** | `blockstream.info` |
| **Mempool** | `mempool.space` |
| **GitHub** | `github.com`, `raw.githubusercontent.com` |

---

## Installation

### Desktop (Chrome / Edge / Brave / Opera)

1. Download the latest release ZIP from [Releases](../../releases)
2. Extract the ZIP to a folder
3. Open Chrome and go to `chrome://extensions/`
4. Turn on **Developer mode** (toggle in top-right)
5. Click **"Load unpacked"** and select the extracted folder
6. The CryptoGuard icon appears in your toolbar

### Android (Elixir Browser / Yandex Browser)

Chrome for Android does not support extensions. Use **Elixir Browser** (free, Chromium-based):

1. Install [Elixir Browser](https://github.com/SF-FLAM/ElixirBrowser) from Github.
2. Download the latest release ZIP
3. In Elixir, tap **⋮ → Extensions**
4. Turn on **Developer mode**
5. Tap **"Load unpacked"** and select the extracted folder
6. Open Extension menu and Tap the CryptoGuard icon to open the popup

> **Note:** On Android, you must keep Developer Mode ON for unpacked extensions to work. The "Chromium can't verify" warning is normal for all sideloaded extensions.

---

## Security Model

CryptoGuard uses Chrome's **`declarativeNetRequest` API** — blocking happens at the browser's network layer **before any page content loads**. This means:

- Phishing pages never render. Not even for a split second.
- No JavaScript on the blocked page can execute.
- No cookies, trackers, or malware payloads can download.

### What CryptoGuard Does NOT Do

| It does NOT... | Because... |
|----------------|------------|
| Replace your hardware wallet | It's a browser firewall, not a wallet |
| Protect against fake apps | It only works inside the browser |
| Stop you from disabling it | You can always turn it off — it's a safety net, not a jail |
| Submit data anywhere | Zero network requests from the extension itself |


---

## Development

### Prerequisites

- Chrome or any Chromium-based browser
- Text editor

### Local Testing

1. Clone or download this repo
2. Make your changes
3. Go to `chrome://extensions/` → **Load unpacked** → select the folder
4. Changes to `background.js` require clicking the **refresh** icon on the extension card
5. Changes to popup files require closing and reopening the popup

### Building a `.crx` Package

1. Go to `chrome://extensions/`
2. Turn on **Developer mode**
3. Click **"Pack extension"**
4. Browse to the extension folder
5. Click **"Pack Extension"** — Chrome generates a `.crx` file

---

## Privacy

- **No data collection.** Period.
- No analytics, crash reporting, or remote logging.
- No external network requests from the extension.
- All storage is local (`chrome.storage.local`).
- The allowlist is hardcoded and user-managed only.

---

## Contributing

Pull requests are welcome. Focus areas:

- Additional verified wallet sites for the built-in allowlist
- Better mobile popup UX
- Translations
- Bug fixes for edge-case Chromium forks

Please open an issue before submitting major changes.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

**Use at your own risk.** This is a security tool, not financial advice. Always verify transactions on your hardware wallet screen before confirming.

---

## Acknowledgments

- Built with Chrome's [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
- Inspired by the need for simple, non-intrusive crypto security tools
- Icon: shield + lock emoji (no external icon dependencies)
