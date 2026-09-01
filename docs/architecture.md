# BetterBacolod architecture guide

## Current shape

- `src/pages` owns route-level composition.
- `src/components` contains reusable UI plus feature-specific sections.
- `src/data` contains site datasets and content indexes; `content` holds editable
  Markdown/YAML content.
- `src/lib` holds shared helpers and renderers; `scripts` owns ingestion and
  content-generation utilities.

This is a sound lightweight structure for the current site. The main pressure
points are the large Energy, Transparency, and Government feature modules and
their adjacent data/components being spread across several top-level folders.

## Feature ownership

Energy, Government, and Transparency now own their route page and private
components under `src/features`. Move other files only while changing their
feature; avoid a repository-wide rename.

```text
src/
  features/
    energy/         # route page and feature-only code
    government/
    transparency/
  components/       # shared UI primitives and layout
  hooks/            # shared hooks
  lib/              # shared helpers, renderers, icon registry
  data/             # shared site datasets and content indexes
```

Feature modules may import `shared`, but features should not import another
feature's private components or data. Promote code to `shared` only after it is
used by at least two features.

## Maintenance rules

- Keep the homepage eagerly loaded; load non-home routes on demand to protect
  the initial bundle.
- Keep build-only packages in `devDependencies` and browser/runtime packages in
  `dependencies`.
- Use `bun run check` for read-only local and CI checks; reserve
  `bun run check:fix` for intentional formatting changes.
- Treat Tailwind 4 and Vite 8 as dedicated migration PRs, not routine updates.
