# Search and AI-crawler visibility

The production build emits initial, readable HTML for the homepage, Transparency
hub, department budgets, DPWH national projects, and six existing Bacolod guides.
The content is available to ordinary visitors and crawlers alike; there is no
bot-specific content or user-agent switching. React replaces the initial content
with the interactive application. Other routes still use the existing SPA shell.

`scripts/site-seo.ts` uses shared metadata and guide content to generate initial
titles, descriptions, canonicals, social cards, and JSON-LD. The department page
publishes Dataset metadata with a JSON download, source URLs, build date, scope,
and proposal/actual-spending caveats. No unverified data licence is claimed.
`src/data/siteMetadata.ts` is shared by runtime and build-time metadata.

Explicit Vercel rewrites select the generated HTML before the SPA fallback.
The homepage is emitted separately to `dist/home/index.html` so unrelated SPA
routes are not served a homepage canonical or homepage body. Base Open Graph
tags are marked for Helmet to manage rather than leaving duplicate generic tags
after client navigation. Filter URLs canonicalize to the unfiltered collection.

The build generates `dist/sitemap.xml` with canonical paths. It does not stamp
every page with the build date as `lastmod`: a deployment is not evidence that
each page's content changed. `public/robots.txt` continues to allow crawling and
points to that sitemap. No crawler access policy was changed.

Verification: `bun test scripts/tests`, `bun run check`, and `bun run build`.
Check the built HTML without JavaScript as well as metadata after client-side
navigation. Adding a guide requires a matching deployment rewrite; tests check
the current guide list. After deployment, Search Console URL inspection and
indexing reports can confirm what Google actually crawls; indexing and ranking
are not guaranteed by this implementation.

First-party guidance:

- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Dataset structured data](https://developers.google.com/search/docs/appearance/structured-data/dataset)
- [Google: Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

Google's AI search features do not require special AI text files or special
schema. This work improves readable content, source attribution, link discovery,
and standard metadata; it does not promise inclusion in AI-generated answers.
