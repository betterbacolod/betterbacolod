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

## Incremental target

Move files only while changing their feature. Avoid a repository-wide rename.

```text
src/
  app/              # Router, app providers, global composition
  features/
    energy/         # page, feature components, feature-only data
    government/
    transparency/
  shared/
    components/     # UI primitives and layout
    hooks/
    lib/
  content/          # runtime content loaders and indexes
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
