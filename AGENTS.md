# BetterBacolod contributor guide

## Project commands

- Install: `bun install --frozen-lockfile`
- Quality check: `bun run check`
- Production build: `bun run build`
- Intentional formatting fixes: `bun run check:fix`

Use Bun for JavaScript/TypeScript work. Python ingestion scripts document their
own dependencies and usage in `scripts/README.md`.

## Architecture

- `src/features` owns feature pages and components private to Energy,
  Government, and Transparency.
- `src/pages` contains small, general route pages.
- `src/components`, `src/hooks`, and `src/lib` are shared code. Promote code
  there only after it serves more than one feature.
- `src/data` contains runtime datasets and content indexes; editable public
  content belongs in `content`.

Keep route pages lazy-loaded unless they are required for the homepage. Do not
use wildcard imports from `lucide-react`; add named icons to
`src/lib/categoryIcons.tsx` when data-driven category icons are needed.

## Change discipline

- Keep dependency upgrades within compatible ranges unless a dedicated migration
  is requested. Tailwind and Vite major upgrades need their own PR.
- Update generated data only through its documented script and preserve source
  metadata.
- Run the quality check and production build before opening a PR.
- Keep commits scoped and use conventional prefixes such as `fix:`, `feat:`,
  `content:`, `docs:`, `perf:`, `refactor:`, or `chore:`.
