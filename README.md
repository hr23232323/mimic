# 👻 Mimic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/hr23232323/mimic)](https://github.com/hr23232323/mimic/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Your UI is ready. You just haven't pasted it yet.**

Mimic is a tiny desktop app that lives in your menu bar. Paste a screenshot, get Tailwind CSS code. That's it.

Built with **Tauri v2**, **Rust**, and **GPT-5.1**.

---

## 🚀 Quick Start

### Download (Easiest)
**[⬇️ Download Latest Release](https://github.com/hr23232323/mimic/releases/latest)**

Pick your platform:
- **macOS**: Download `.dmg` → Drag to Applications
- **Windows**: Download `.msi` → Run installer
- **Linux**: Download `.AppImage` → Make executable & run

### Or Build from Source
See [Install](#install) section below.

### First Time Setup
1. Open Mimic from menu bar (👻 ghost icon)
2. Click Settings → Add your OpenAI API key
3. Paste a screenshot (`Cmd+V`)
4. Watch the magic happen ✨

---

## Why?

I got tired of:
- Writing boilerplate HTML from mockups
- Guessing padding values
- Opening a million tabs to recreate a simple button

So I built this. It sits in your menu bar. You paste a screenshot. It gives you clean HTML + Tailwind code. Done.

---

## ✨ Features

- 🎯 **Invisible** — Lives in your menu bar, uses ~0% resources when idle
- 📋 **Paste & Go** — `Cmd+V` (or drag-drop) any screenshot
- 👁️ **Live Preview** — See the generated UI with device frames
- 📱 **Device Previews** — Test on mobile (390x844) and desktop (1080x675) windows
- 🤖 **AI Refinement** — Chat with the ghost to modify your code ("make it responsive")
- 📚 **Generation History** — Auto-saves last 30 generations with thumbnails
- 📝 **Code Editor** — Syntax-highlighted HTML editor with live updates
- 🚀 **Rust Fast** — Tauri v2 means native performance, tiny binary (~10MB)
- 🔒 **Privacy-First** — Everything stored locally, no tracking

---

## Install

### You Need
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (latest stable)
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Run It
```bash
git clone https://github.com/hr23232323/mimic.git
cd mimic
npm install
npm run tauri dev
```

### Build It
```bash
npm run tauri build
```

Outputs will be in `src-tauri/target/release/bundle/`.

---

## 🔧 How It Works

1. **Paste** a screenshot (or drag-drop)
2. **AI generates** HTML + Tailwind code via GPT-5.1 Vision API
3. **Preview** the generated UI with device frames
4. **Refine** using natural language ("make it responsive")
5. **Test** on mobile/desktop preview windows
6. **Copy** the code and ship it

No cloud storage. No tracking. Your API key stays on your machine.

All generations auto-saved locally for easy access.

---

## Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS v4
- Vite 7

**Backend**
- Tauri v2 (Rust)
- reqwest (HTTP client)
- OpenAI GPT-4o API

---

## Privacy

- API key stored locally (Tauri plugin-store)
- Images sent directly to OpenAI (not stored anywhere else)
- No analytics, no telemetry, no BS

---

## 🤝 Contributing

Built over a weekend with passion. It works, it's fast, and it's ready for your ideas.

**High-priority features:**
- [ ] Claude 3.5 Sonnet support
- [ ] Export as React/Vue/Svelte components
- [ ] Batch processing multiple screenshots
- [ ] Custom Tailwind config support
- [ ] Dark mode for generated code
- [ ] Keyboard shortcuts
- [ ] Homebrew cask formula

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

**Found a bug?** [Open an issue](https://github.com/hr23232323/mimic/issues/new/choose)

---

## Roadmap

Things I might add (or you can PR):
- Multiple AI model support (Claude, Gemini)
- Dark mode for code output
- Custom Tailwind config
- Annotation tools for screenshots
- "Copy to Figma" plugin

---

## License

MIT — do whatever you want with it.

---

## 🙏 Acknowledgments

Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/).

Powered by OpenAI's GPT-5.1.

---

## 📦 Distribution

**Pre-built Binaries:** Available in [GitHub Releases](https://github.com/hr23232323/mimic/releases)

**Homebrew (coming soon):**
```bash
brew install --cask mimic
```

---

**Note:** You need an OpenAI API key. Usage is billed by OpenAI at their standard rates (~$0.01-0.05 per screenshot).
