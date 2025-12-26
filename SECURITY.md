# Security Policy

## Our Privacy Commitment

Mimic is built with privacy as a core principle:

- **Local-First**: Your API keys and generation history are stored locally on your machine using Tauri's secure storage
- **No Tracking**: We don't collect analytics, usage data, or telemetry
- **No Cloud**: Screenshots and generated code never touch our servers
- **Direct API Calls**: Communication goes directly from your machine to OpenAI's API

## What Data is Stored Locally

The following data is stored on your local machine:

- **API Key**: Encrypted and stored in `~/.local/share/com.mimic.desktop/settings.json` (macOS/Linux) or `%APPDATA%\com.mimic.desktop\settings.json` (Windows)
- **Generation History**: Last 30 generations including screenshots (base64) and generated code
- **User Preferences**: Window size, last used settings

## Reporting a Vulnerability

If you discover a security vulnerability in Mimic, we appreciate your help in disclosing it responsibly.

**Please DO NOT open a public issue.**

Instead, please report it privately by:

1. **Email**: Send details to the maintainers (check GitHub profile for contact)
2. **GitHub Security Advisory**: Use the "Security" tab on the repository to create a private security advisory

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- We'll acknowledge your report within 48 hours
- We'll provide a detailed response within 7 days
- We'll work on a fix and coordinate disclosure timing with you
- You'll be credited in the fix release (unless you prefer to remain anonymous)

## Security Best Practices for Users

- **Protect your API key**: Never share your OpenAI API key with anyone
- **Check your usage**: Monitor your OpenAI API usage dashboard regularly
- **Keep Mimic updated**: Install updates when available
- **Verify downloads**: Only download Mimic from official GitHub releases

## Third-Party Dependencies

Mimic relies on:
- **OpenAI API**: Your API calls are subject to OpenAI's security and privacy policies
- **Tauri Framework**: Security updates are incorporated as they're released
- **Tailwind CDN**: Used in preview windows (loaded from cdn.tailwindcss.com)

We regularly update dependencies to patch known security vulnerabilities.

---

**Last Updated**: January 2025
