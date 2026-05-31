# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Snapshot

BetterBacolod is an open-source civic information portal for Bacolod City,
Negros Occidental. It is not an official government website; content should
stay factual, source-backed, and clear about official transaction channels.

Stack:

- React 19, TypeScript, Vite
- Tailwind CSS for styling
- Biome for linting and formatting
- Bun as the package manager and script runner
- Orama for prebuilt full-text search
- Vercel for deployment

## Working Rules

- Read nearby code and docs before editing. Prefer existing components,
  utility functions, route patterns, and Tailwind conventions.
- Keep changes scoped. Do not refactor unrelated files while making content or
  feature updates.
- Protect user work. Check `git status --short` before editing and do not
  overwrite unrelated local changes.
- Prefer ASCII for new code and docs unless the file already uses non-ASCII or
  the content needs Philippine peso signs, local names, or copied source text.
- Add comments only for non-obvious behavior.

## Commands

Use Bun for JavaScript/TypeScript work:

```bash
bun install
bun run dev
bun run lint
bun run build
```

Useful scripts:

- `bun run dev`: start the Vite dev server.
- `bun run lint`: run Biome linting. This is the non-mutating check used in CI.
- `bun run build`: run `tsc -b`, Vite build, then generate
  `dist/search-index.json`.
- `bun run generate-index`: generate the Orama search index after a build has
  produced `dist/`.
- `bun run format`: format files with Biome.
- `bun run check`: runs `biome check --write .`; this mutates files.

CI on pull requests runs:

```bash
bun install
bun run lint
bun run build
```

Python scripts for fuel-price data need:

```bash
pip install -r requirements.txt
python3 scripts/fetch-doe-fuel-prices.py --dry-run
```

## Repository Layout

- `src/App.tsx`: top-level routes and layout.
- `src/pages/`: route pages.
- `src/components/`: page sections, layout, and reusable UI.
- `src/data/`: YAML/JSON data and loaders.
- `src/lib/`: markdown rendering, search, table, typography, and utilities.
- `content/`: Markdown/YAML content shown on the site.
- `public/`: static assets, icons, robots, sitemap, and web manifest.
- `scripts/`: search-index generation and fuel-price import/fetch scripts.

## Content Model

Service categories start in `src/data/services.yaml`. Each category needs:

- `category`: display label.
- `slug`: folder name under `content/services/`.
- `description`: used on service pages and search.
- `icon`: a valid `lucide-react` icon export name.

Each service category folder should contain:

- `index.yaml` with a `pages:` array.
- One Markdown file per page, named `{slug}.md`.

Example:

```yaml
pages:
  - name: 'Business Permits in Bacolod City (New & Renewal)'
    slug: 'apply-for-barangay-clearance-and-mayors-business-permits'
    description: 'Apply for new business permits or renew at BPLO.'
```

Important: category index files are statically imported in
`src/data/yamlLoader.ts`. When adding or renaming a service category, update the
imports and `categoryIndexMap` there as well as `src/data/services.yaml`.

Markdown service documents are loaded from
`content/services/{categorySlug}/{documentSlug}.md`. The first `#` heading is
used as the page title, and the first paragraph after it is used as the
description. Keep service pages structured with headings, requirements, steps,
contact information, and a `Sources` section when possible.

Government content lives in `content/government/` and is organized by
`src/data/government.yaml`. Transparency data lives in
`src/data/transparency/*.json` and supporting content in
`content/transparency.md`.

Some BetterBacolod civic data is currently hard-coded in React components, not
only in Markdown:

- Officials: `src/components/government/OfficialsSection.tsx`
- Departments: `src/components/government/DepartmentsSection.tsx`
- Barangays: `src/components/government/BarangaysSection.tsx`
- About-page city stats and hotlines: `src/pages/About.tsx`
- Transparency tiles and external links: `src/pages/Transparency.tsx`

When updating officials, departments, barangay captains, hotlines, fees,
requirements, dates, or office contacts, verify against the best available
official source first. Prefer `bacolodcity.gov.ph`, official Bacolod City
Facebook pages, Philippine government portals, DOE/DPWH/DBM/COA/PhilGEPS, PSA,
or the cited source already used by the page. Include source links and the date
checked in Markdown service pages when practical.

Keep the site's civic framing consistent:

- Use "BetterBacolod.org" for the site/brand.
- Say "Bacolod City" for the place/government context.
- Preserve the unofficial-site disclaimer when editing About, footer, or
  transaction guidance.
- Direct users to official offices or official websites for actual
  transactions.
- Do not present unverified contact details, fees, eligibility rules, or
  elected-official names as current.

## Search

Search uses a prebuilt Orama index:

- `scripts/generate-search-index.ts` reads `src/data/services.yaml` and all
  Markdown files under `content/services/`.
- `bun run build` runs the generator after Vite build and writes
  `dist/search-index.json`.
- `src/lib/searchIndex.ts` loads `/search-index.json` at runtime and falls back
  to an empty index if loading fails.

When adding content that should be searchable, make sure it is represented in
the category YAML and Markdown structure, then run `bun run build`.

## UI and Styling

- Use Tailwind utility classes and the existing design tokens from
  `tailwind.config.js`.
- Reuse `Section`, `Card`, `Heading`, `Text`, `ListItem`, `Breadcrumbs`, and
  existing layout components before creating new primitives.
- Use `cn` from `src/lib/utils.ts` for conditional Tailwind class composition.
- Use `lucide-react` icons when icons are needed.
- Keep layouts responsive. Service pages and markdown tables should work on
  mobile; markdown tables are rendered through `TableWithToggle`.
- SEO should go through `src/components/SEO.tsx`; site-wide structured data is
  in `src/components/StructuredData.tsx`.

## Formatting and TypeScript

Biome settings:

- 2 spaces
- line width 80
- single quotes
- semicolons
- CSS files are excluded from Biome formatting/linting

TypeScript is strict. Avoid unused locals/parameters because `tsc -b` runs in
the production build.

## Data and Automation

Fuel-price data is stored in `src/data/transparency/fuel-prices.json`.

- Preferred updater: `.github/workflows/fuel-prices-refresh.yml`.
- Local fetcher: `scripts/fetch-doe-fuel-prices.py`.
- XLSX fallback: `scripts/import-fuel-prices.py`.

The fuel-price workflow runs Tuesday through Friday at 09:00 PHT, fetches DOE
Visayas PDF reports, and opens PRs when JSON changes.

Release automation uses release-please:

- Config: `release-please-config.json`.
- Manifest: `.release-please-manifest.json`.
- Commit types include `feat`, `fix`, `perf`, `content`, `docs`, `refactor`,
  `chore`, `ci`, and `test`.

## Before Finishing Work

Run the most relevant check for the change:

- Content-only change: usually `bun run lint`; run `bun run build` if YAML,
  routes, search, or imported content structure changed.
- Code/UI change: `bun run lint` and `bun run build`.
- Fuel-price script change: run the relevant Python command with `--dry-run`
  or a local fixture when available.

If a check cannot run because dependencies are missing, network is blocked, or
the working tree already has a known unrelated breakage, report that explicitly.
