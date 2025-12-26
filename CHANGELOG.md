# Changelog

All notable changes to Mimic will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-XX

### Added
- **Core Feature**: Screenshot-to-Tailwind code generation using GPT-5.1
- **Instant Preview**: Live preview of generated UI with device frames
- **Device Previews**: Open mobile (390x844) and desktop (1080x675) preview windows
- **AI Refinement**: Natural language code modifications via chat interface
- **Generation History**: Store and restore last 30 generations with thumbnails
- **Version Tracking**: Track refinements as child versions of original generations
- **Menu Bar App**: System tray integration for quick access
- **Image Input**: Paste (Cmd+V) or drag-and-drop screenshots
- **Code Editor**: Syntax-highlighted HTML editor with CodeMirror
- **Local Storage**: All data stored locally with Tauri plugin-store
- **Error Handling**: Graceful error messages with reset functionality
- **Aspect Ratio Preservation**: Preview maintains original screenshot proportions
- **Custom Branding**: Ghost icon theme throughout the app

### Technical
- Built with Tauri v2 + React 19 + TypeScript
- Tailwind CSS v4 styling
- Rust backend with OpenAI API integration
- Multi-window support with data URLs
- Local-first architecture (no cloud sync)

### Security
- API keys stored locally and encrypted
- No telemetry or tracking
- Direct API communication (no proxy servers)
- Privacy-first design

---

## [Unreleased]

### Planned
- Export to React/Vue/HTML components
- Dark mode toggle
- Custom AI model selection
- Batch processing multiple screenshots
- Keyboard shortcuts
- Undo/redo functionality
- Image optimization before sending to API
- Support for other AI providers (Claude, Gemini)
- Community component library

---

**Note**: This is the initial release. Future versions will follow semantic versioning.
