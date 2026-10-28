# FY2027 national project explorer

`/transparency/national-projects` uses the public BetterGov API directly from
the browser. It covers DPWH comparison records tagged NIR, not all agency budgets
or actual expenditures. The City Budget explorer remains a separate dataset.

The default view is the district leaderboard, with source-provided representative
portraits. Projects and Charts have separate tabs. At widths below 1024px,
district details open in a full-screen sheet after tapping a portrait row;
desktop keeps the side-by-side project spotlight. Project source details use a
full-screen sheet below 640px. Sheets lock background scrolling, restore focus,
and support browser Back and Escape. All motion respects reduced-motion settings.

## Source and loading

- API: `https://budget.bettergov.ph/api/v1/hgab/2027/datasets/dpwh/projects?region=NIR&limit=200&offset=0`
- Contract: <https://github.com/bettergovph/ai-budget/blob/main/docs/hgab-api.md>
- Source documents: <https://budget.bettergov.ph/hgab/2027/sources>

All pages must load with one source revision, unique record IDs, and reconciled
NEP/House totals before a result is displayed. Amounts are integer pesos; null
means no matching line in that version. Versions are compared, never added.
The browser caches a complete result in memory for five minutes. Refresh bypasses
that cache. There is no scheduled import or API key. If refresh fails, the last
successful result stays visible with a warning. First-load failures show Retry.

## Interpretation

The Bacolod shortcut selects `Bacolod City District Engineering Office`, not geographic city boundaries.
The NIR view also includes Central Office projects. Text searches can match roads
named after Bacolod outside the city and must not be presented as city totals.
Office context preserves the source's attribution tiers, shared districts,
office-change annotations, and link to unassigned residuals. Project-list sums
can differ from the office leaderboard's deliberately restricted figures.

Uncertainty flags stay visible in both the results and source details. Comparison
candidates alone do not establish irregularity or political responsibility.
CSV exports preserve nulls, source revision/date, flags and upstream record URLs.

## Development checks

Run `bun test scripts/tests/national-projects.test.ts`, `bun run check`, and
`bun run build`. Check the live screen and API-failure behavior at mobile and
desktop widths. Shareable query parameters are `q`, `office`, `program`, `group`,
`held`, `sort`, `page`, and `project`. This feature has no server-side API route.
Leaderboard state also uses `view`, `district`, `area`, and `rank`. District
figures use `/api/v1/hgab/2027/districts?region=NIR&limit=254` and must match the
project list's source revision. Shared-office amounts remain undivided; the same
amount can appear for multiple associated districts. Ranks are not spending or
representative performance scores. The largest office projects are sorted by
House proposal amounts, not by an official priority rating.

## Search and sharing

The build generates `dist/transparency/national-projects/index.html` with the
route's canonical URL, Open Graph and Twitter tags, CollectionPage/BreadcrumbList
structured data, and a readable introduction that works without JavaScript.
Vercel routes both trailing-slash variants to this file before the SPA fallback.
React replaces the static introduction when it starts; live amounts are never
cached into the crawler HTML. Shared metadata lives beside the feature so the
build and browser descriptions stay aligned.

The 1200x630 PNG share image has an editable SVG source in `public/images/social`.
It describes the feature without publishing budget figures that could become
outdated. Filtering query parameters share the main page's canonical URL.
