# Contributing to Mimic

Thanks for checking this out. Here's the deal:

## The Vibe

This was built in a weekend. The code is messy. It works. If you want to clean it up, cool. If you want to add features, even better.

No formal process. Just:
1. Fork it
2. Make it better
3. Send a PR

## Setup

```bash
git clone your-fork
cd mimic-desktop
npm install
npm run tauri dev
```

You'll need an OpenAI API key to test.

## What Needs Work

Check the [README roadmap](README.md#roadmap) or [open issues](../../issues).

High priority stuff:
- Claude 3.5 Sonnet support
- Better syntax highlighting
- Generation history
- Export to React/Vue/Svelte

## Code Style

- TypeScript: use types, avoid `any`
- React: functional components
- Rust: run `cargo fmt` before committing
- Commits: doesn't matter, just be clear

## Before You PR

- Does it run? (`npm run tauri dev`)
- Does it build? (`npm run tauri build`)
- Did you test it?

That's it.

## Questions?

Open an issue. I'll respond when I can.

---

No CoC, no bureaucracy. Just build cool stuff and don't be a jerk.
