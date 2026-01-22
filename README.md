# BetterBacolod.org

Open-source civic tech portal for Bacolod City, Negros Occidental, Philippines.

🌐 **Live:** [betterbacolod.org](https://betterbacolod.org)  
💬 **Discord:** [Join our community](https://discord.gg/EZkdJrhBYV)

---

## About

BetterBacolod makes government information accessible. We compile publicly available data from official sources and present it in a user-friendly format.

**Features:**
- 📋 45+ government services with requirements & fees
- 👥 City officials, departments & 61 barangays
- 📊 Transparency data (flood control, budget, procurement)
- 🔍 Full-text search powered by Orama (typo-tolerant, instant results)
- 📱 Mobile responsive

> ⚠️ **Not an official government website.** For official transactions, visit [bacolodcity.gov.ph](https://bacolodcity.gov.ph)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Biome | Linting & Formatting |
| Bun | Package Manager |
| Vercel | Hosting |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/betterbacolod/betterbacolod.git
cd betterbacolod

# Install dependencies (requires Bun)
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Lint & format
bun run lint
bun run check
```

**Don't have Bun?** Install it: `curl -fsSL https://bun.sh/install | bash`

---

## Project Structure

```
betterbacolod/
├── src/
│   ├── components/       # React components
│   │   ├── government/   # Officials, departments, barangays
│   │   ├── home/         # Homepage sections
│   │   ├── layout/       # Navbar, Footer, TopBanner
│   │   ├── sections/     # Hero, etc.
│   │   ├── transparency/ # Transparency data components
│   │   └── ui/           # Reusable UI components
│   ├── pages/            # Route pages
│   ├── data/             # YAML/JSON data loaders
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities & markdown
├── content/
│   ├── services/         # Service pages (markdown)
│   └── government/       # Government info (markdown)
├── public/               # Static assets
├── biome.json            # Biome config
├── vercel.json           # Vercel config
└── package.json
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

**Quick ways to help:**
- 🐛 Report bugs via [GitHub Issues](https://github.com/betterbacolod/betterbacolod/issues)
- 📝 Update outdated info (officials, fees, contacts)
- 🌐 Add translations (Hiligaynon, Filipino)
- ✨ Submit new features via PR

**Branch workflow:**
```bash
git checkout -b feat/your-feature
# make changes
bun run lint
bun run build
git commit -m "feat: your feature"
git push origin feat/your-feature
# open PR on GitHub
```

---

## Data Sources

- [bacolodcity.gov.ph](https://bacolodcity.gov.ph) - Official city website
- [PSA](https://psa.gov.ph) - Population data
- [BetterGov.ph](https://bettergov.ph) - Transparency data
- [PhilGEPS](https://philgeps.gov.ph) - Procurement data

---

## Contributors

Thanks to everyone who has contributed to BetterBacolod! 💙

<a href="https://github.com/betterbacolod/betterbacolod/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=betterbacolod/betterbacolod" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

---

## Community

- 💬 [Discord](https://discord.gg/EZkdJrhBYV) - Chat with contributors
- 📘 [Facebook](https://facebook.com/betterbacolod.org) - Updates & announcements

---

## License

MIT License - see [LICENSE](LICENSE)

---

💸 **Cost to build:** ₱435.39

Forked from [iyanski/betterlocalgov](https://github.com/iyanski/betterlocalgov) · Inspired by [BetterGov.ph](https://bettergov.ph)
