# scripts

## Fuel-price ingestion

The `Fuel Price Watch` page (`/transparency` → Fuel Price Watch tile) is backed
by `src/data/transparency/fuel-prices.json`, which is regenerated weekly from
the DOE Visayas Field Office retail-pump-price report.

### Auto-refresh (preferred)

`.github/workflows/fuel-prices-refresh.yml` runs every **Tuesday – Friday at
09:00 PHT** (01:00 UTC). Each run:

1. Computes the most recent Tuesday and downloads the DOE PDF from the
   predictable URL `https://prod-cms.doe.gov.ph/documents/d/guest/vfo-price-monitoring-MMDDYY-pdf`.
2. Extracts the **Bacolod City** row and merges it into the JSON.
3. Opens a pull request titled `content(fuel-prices): auto-update from DOE`
   if the JSON has new data.

Reviewer just merges the PR — `release-please` picks it up and proposes the
next version bump.

If DOE is late, the workflow exits cleanly (status code `78`) and retries the
next morning. If parsing fails, it opens a GitHub issue with the error log.

You can also trigger the workflow manually from the GitHub Actions UI
(`workflow_dispatch`).

### Local CLI: `fetch-doe-fuel-prices.py`

```bash
pip install -r requirements.txt

# Most recent Tuesday — what the cron does:
python3 scripts/fetch-doe-fuel-prices.py

# A specific Tuesday:
python3 scripts/fetch-doe-fuel-prices.py --date 2026-04-21

# Parse + print, do not write JSON:
python3 scripts/fetch-doe-fuel-prices.py --date 2026-04-21 --dry-run

# Backfill a range (every Tuesday inclusive):
python3 scripts/fetch-doe-fuel-prices.py --backfill 2025-12-30 2026-04-21

# Use a local PDF (for testing / when DOE is unreachable):
python3 scripts/fetch-doe-fuel-prices.py --pdf-path /tmp/sample.pdf --date 2026-04-21
```

Exit codes: `0` success or no-op · `78` DOE has not yet published · `1` parse
error.

### Fallback: `import-fuel-prices.py` (XLSX)

Originally Shiro_Oni shared a Power BI XLSX export. `import-fuel-prices.py`
ingests that XLSX format. Kept as a fallback path in case the DOE PDF endpoint
breaks; will be removed once auto-refresh has a few weeks of stable runs.

```bash
python3 scripts/import-fuel-prices.py ~/Downloads/BacolodFuelPrices/BacolodFuelPrices.xlsx
```

### Search index: `generate-search-index.ts`

Run automatically by `bun run build` after Vite finishes. Indexes the site for
Orama full-text search; not related to fuel prices.
