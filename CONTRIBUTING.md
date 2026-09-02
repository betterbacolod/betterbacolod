# Contributing to BetterBacolod

Thanks for your interest in contributing! 🎉

## Ways to Contribute

### 🐛 Report Bugs

- Open an issue with steps to reproduce
- Include screenshots if possible

### 📝 Update Content

- Outdated info (phone numbers, officials, fees)
- Missing services or departments
- Typos and corrections

### 💻 Code Contributions

- Bug fixes
- New features
- Performance improvements

### 🌐 Translations

- Hiligaynon
- Filipino

## Getting Started

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/betterbacolod.git
cd betterbacolod

# Install dependencies
bun install

# Start dev server
bun run dev
```

## Content Structure

```
content/
├── services/           # Service pages (markdown)
│   ├── health-services/
│   ├── business/
│   └── ...
src/
├── components/
│   └── ui/             # Shared UI primitives
├── features/
│   ├── government/     # Government page and private components
│   └── transparency/   # Transparency page and private components
├── data/
│   ├── services.yaml   # Service categories
│   └── government.yaml # Government categories
```

See [AGENTS.md](AGENTS.md) for commands, architecture conventions, and change
discipline.

## Submitting Changes

1. Create a branch: `git switch -c fix/your-fix`
2. Make changes and test locally
3. Commit: `git commit -m "fix: description"`
4. Push: `git push origin fix/your-fix`
5. Open a Pull Request

## Commit Messages

Use prefixes:

- `fix:` - bug fixes
- `feat:` - new features
- `docs:` - documentation
- `content:` - content updates

## Questions?

- Discord: [Join our server](https://discord.gg/betterbacolod)
- GitHub Issues: Open a discussion

---

Built with ❤️ for Bacolod City
