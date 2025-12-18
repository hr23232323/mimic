# 👻 Mimic

**Your UI is ready. You just haven't pasted it yet.**

Mimic is a tiny desktop app that lives in the background. Paste a screenshot, get the Tailwind CSS code. That's it.

Built with **Tauri v2**, **Rust**, and **GPT-4o**.

![Demo](https://via.placeholder.com/800x400?text=Add+your+demo+GIF+here)

---

## Why?

I got tired of:
- Writing boilerplate HTML from mockups
- Guessing padding values
- Opening a million tabs to recreate a simple button

So I built this. It sits in your menu bar. You paste a screenshot. It gives you clean HTML + Tailwind code. Done.

---

## Features

- **Invisible** — Lives in your menu bar, uses ~0% resources when idle
- **Paste & Go** — `Cmd+V` (or drag-drop) any screenshot
- **Live Preview** — See the generated UI rendered instantly
- **One-Click Copy** — Grab the code and ship it
- **Rust Fast** — Tauri v2 means native performance, tiny binary

---

## Install

### You Need
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (latest stable)
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Run It
```bash
git clone https://github.com/yourusername/mimic-desktop.git
cd mimic-desktop
npm install
npm run tauri dev
```

### Build It
```bash
npm run tauri build
```

Outputs will be in `src-tauri/target/release/bundle/`.

---

## How It Works

1. You paste a screenshot
2. It sends the image to GPT-4o (Vision API)
3. GPT generates clean HTML with Tailwind classes
4. You get a split view: original screenshot vs. generated code
5. Toggle to live preview, copy the code, done

No cloud storage. No tracking. Your API key stays on your machine.

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

## Contributing

This was vibe-coded in a weekend. It's messy. It works.

PRs welcome! Specifically looking for:
- [ ] Claude 3.5 Sonnet support
- [ ] Better code formatting/syntax highlighting
- [ ] History/save previous generations
- [ ] Export as React/Vue components
- [ ] Batch processing multiple screenshots

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

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

## Acknowledgments

Built with [Tauri](https://tauri.app/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/).

Powered by OpenAI's GPT-4o.

---

**Note:** You need an OpenAI API key. Usage is billed by OpenAI at their standard rates.
