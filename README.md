<div align="center">

# ⚡ Text Preview

### *Instant, Frictionless Document Publishing & Sharing*
**Architected & Engineered under the 🌌 [divyanshverse](https://github.com/divyanshverse) ecosystem**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](#license)
[![Ecosystem](https://img.shields.io/badge/Built_Under-divyanshverse-8B5CF6?style=for-the-badge&logo=rocket&logoColor=white)](#-built-under-divyanshverse)

<br/>

> **DocShowcase** is a blazingly fast, privacy-focused document publishing engine. Write rich Markdown or HTML in a Monaco-powered dual-pane editor, render complex LaTeX mathematics in real time, protect sensitive notes with client-side SHA-256 hashes, and share documents globally in one click — **no sign-up, no clutter, zero barrier to entry.**

[Explore Features](#-key-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture--tech-stack) • [Security](#-security--cryptography) • [API Reference](#-api-endpoints)

---

</div>

## 🌌 Built Under divyanshverse

**DocShowcase** was conceived, styled, and engineered under **divyanshverse** — a forward-thinking creative laboratory dedicated to crafting fluid, developer-first tools, high-performance web applications, and aesthetic digital experiences.

Every component in DocShowcase adheres to the core philosophy of **divyanshverse**:
- **Speed First**: Sub-second interactions, zero friction, and instantaneous share links.
- **Craftsmanship**: Tasteful neomorphic and glassmorphic micro-details with native dark & light modes.
- **Privacy by Design**: Decentralized access models, zero-account publishing, and optional cryptographic locks.

---

## ⚡ Key Features

### 📝 Dual-Pane Pro Monaco Editor
- **Interactive Split View**: Live bidirectional synchronization between editor and rendered output.
- **Multi-Format Support**: Switch seamlessly between **GitHub Flavored Markdown (GFM)**, raw **HTML**, and rich text layouts.
- **Real-time LaTeX & KaTeX**: First-class support for mathematical expressions, formulas, matrices, and scientific notation:
  $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
- **Full Undo / Redo Timeline**: In-memory historical state tracking with shortcut support (`Ctrl+Z` / `Ctrl+Y`).

### 🔐 Cryptographic Protection & Ephemerality
- **Password Locking**: Protect confidential documents using client-side **SHA-256** hash verification.
- **Burn After Reading**: Self-destructing documents after a single view.
- **Time-to-Live (TTL)**: Schedule automatic document expiration on a chosen date and time.
- **Edit Passkeys**: Author-only modification locks preventing unauthorized document tampering.

### 🌐 Instant Sharing & Zero Setup
- **Instant Slugs**: Generate clean, shareable URLs in seconds (e.g. `/doc/a8f2k9e1`).
- **Dynamic QR Code Generation**: Instant high-density canvas QR code for mobile handoffs and offline scanning.
- **Raw Document API (`/raw/:id`)**: Fetch bare Markdown or HTML straight from your terminal via `curl` or embed in scripts.
- **Server-Side OpenGraph Injection**: Rich social media cards with dynamic document titles and summaries when shared on Twitter/X, Discord, Slack, or LinkedIn.

### 🎨 Clean Aesthetic Design System
- Adaptive **Dark / Light mode** toggle with persistent user preference.
- Neomorphic elevation depth, subtle backdrop blur, and custom typography powered by *Inter* and *JetBrains Mono*.

---

## 🏗 Architecture & Tech Stack

DocShowcase is built as a hybrid high-performance React application powered by a custom Express + Vite server:

```
                      ┌──────────────────────────────────────────────┐
                      │                 Client Browser               │
                      └───────┬──────────────────────────────▲───────┘
                              │                              │
                     Document Updates                Rendered View +
                     & Passkey Checks                Realtime KaTeX
                              │                              │
                              ▼                              │
        ┌────────────────────────────────────────────────────┴────────┐
        │                   Express Full-Stack Server                 │
        │                                                             │
        │  • /api/verify-passkey  ──> Hash Comparison                 │
        │  • /raw/:id             ──> Raw Content Plaintext/HTML      │
        │  • /view/:id            ──> Dynamic Server-side OG Tags     │
        │  • Vite Middleware      ──> Instant HMR & Static Assets     │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
                         Reads / Writes via Firestore SDK
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │            Google Cloud Firestore (NoSQL Cluster)           │
        │       Collection: 'documents' (Keyed by 8-char Slugs)       │
        └─────────────────────────────────────────────────────────────┘
```

### 🛠 Core Technologies
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | High-speed concurrent UI rendering & component logic |
| **Build & Dev Tool** | Vite 6 + TSX | Instantaneous bundling and ES module middleware |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-grade editing experience with syntax highlighting |
| **Styling** | Tailwind CSS v4 | Cutting-edge utility styling with modern CSS engine |
| **Math & Parsing** | KaTeX + React-Markdown + Remark-GFM | Accelerated LaTeX typesetting and sanitized GFM output |
| **Backend Runtime** | Node.js + Express 4 | Server-side endpoints, raw content delivery, and OG injection |
| **Database** | Firebase Firestore | Global real-time document storage and persistence |
| **Animation & Icons**| Motion + Lucide React | Micro-interactions, smooth modals, and modern iconography |

---

## 📁 Repository Structure

```
DocShowcase/
├── package.json               # Project manifest, dependencies & scripts
├── tsconfig.json              # TypeScript compilation specifications
├── vite.config.ts             # Vite configuration with Tailwind plugin
├── server.ts                  # Express server + Vite middleware + OpenGraph injector
├── metadata.json              # Applet metadata, capabilities & identifiers
├── index.html                 # HTML shell with Google Fonts & KaTeX stylesheets
├── public/                    # Static assets & icons
└── src/
    ├── main.tsx               # Client React entrypoint
    ├── App.tsx                # App routing (Home, Editor, Viewer, Raw)
    ├── firebase.ts            # Client Firestore connection provider
    ├── store.ts               # Local & remote document state synchronization
    ├── types.ts               # Comprehensive TypeScript domain interfaces
    ├── index.css              # Global styles, Tailwind v4 imports, neomorphic utilities
    ├── components/
    │   ├── CodeEditor.tsx     # Dual Monaco / textarea editor with live formatting
    │   ├── Preview.tsx        # Markdown, HTML, and KaTeX math renderer
    │   ├── ThemeProvider.tsx  # Dark / Light theme context provider
    │   ├── SettingsModal.tsx  # Document security, passkey & expiration controls
    │   └── ErrorBoundary.tsx  # Graceful UI error handling
    ├── hooks/
    │   ├── useEditorSettings.ts  # Editor font, word wrap & tab configuration
    │   └── useHistory.ts      # Undo / redo snapshot state management
    └── pages/
        ├── Home.tsx           # Landing page & recent documents dashboard
        ├── EditorPage.tsx     # Full-featured authoring workspace
        └── ViewPage.tsx       # Distraction-free reader view with password unlock
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 1. Clone & Install
```bash
git clone https://github.com/divyanshverse/DocShowcase.git
cd DocShowcase
npm install
```

### 2. Configure Environment
Ensure your `firebase-applet-config.json` exists in the project root:
```json
{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "your-sender-id",
  "appId": "your-app-id",
  "firestoreDatabaseId": "your-custom-db-id"
}
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Cryptography

DocShowcase takes document integrity and privacy seriously:
1. **Zero-Knowledge Password Verification**: When a user locks a document with a password, the raw password is never sent across the wire. Instead, a **SHA-256** hash digest is computed in the browser using the Web Cryptography API (`crypto.subtle.digest`) and verified against the stored hash.
2. **Edit Passkey Isolation**: Authors can generate a unique modification passkey. Even if someone discovers the public document URL, editing permissions require the cryptographic passkey.
3. **HTML Sanitization**: Custom HTML embeds are rendered inside isolated containers to prevent cross-site scripting (XSS) vectors.

---

## 📡 API Endpoints

### `GET /raw/:id`
Retrieves the raw unformatted Markdown or HTML content of a document.
```bash
# Example curl request
curl -s https://your-domain.com/raw/d8b2a1f4
```
**Response:** `text/plain; charset=utf-8` with raw document body.

### `POST /api/verify-passkey`
Validates an edit passkey against document permissions.
- **Body**: `{ "id": "string", "passkeyHash": "sha256-hex" }`
- **Response**: `{ "success": true }` or `{ "error": "Invalid passkey" }`

### `GET /view/:id`
Serves the reader view with pre-rendered server-side OpenGraph `<meta>` tags for title, excerpt, and image previews across social bots (Twitterbot, Discordbot, Slackbot, LinkedInBot).

---

## ⌨️ Shortcuts & Pro-Tips

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Undo last content change |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo content change |
| `$$ ... $$` | Render block-level mathematical equations via KaTeX |
| `$ ... $` | Render inline mathematical symbols |
| `Ctrl + S` / `Cmd + S` | Force-save document state |

---

## 🤝 Contributing

Contributions, feedback, and feature suggestions are enthusiastically welcomed!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature under divyanshverse'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**✨ Created with precision & care by the [divyanshverse](https://github.com/divyanshverse) team ✨**

*Fast • Minimal • Secure • Beautiful*

</div>
