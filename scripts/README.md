# scripts

## Fuel-price ingestion

The `Fuel Price Watch` page (`/transparency` → Fuel Price Watch tile) is backed
by `src/data/transparency/fuel-prices.json`, which is regenerated weekly from
the DOE Visayas Field Office retail-pump-price report.

### Auto-refresh (preferred)

`.github/workflows/fuel-prices-refresh.yml` runs every **Tuesday – Friday at
09:00 PHT** (01:00 UTC). Each run:

1. Computes the most recent Tuesday and downloads the DOE PDF from the
   official [DOE Visayas Pump Prices listing](https://doe.gov.ph/data-and-prices/liquid-fuels/retail-pump-prices/visayas-pump-prices),
   then downloads the dated PDF attachment. This matters because DOE periodically
   changes attachment filenames.
2. Checks a rolling catch-up window for missing Tuesday reports, extracts the
   **Bacolod City** row, and merges available weeks into the JSON.
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

# Check recent missing weeks after the latest imported JSON week:
python3 scripts/fetch-doe-fuel-prices.py --catch-up-weeks 8

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

## Electric-grid ingestion

The `Energy` page (`/energy`) is backed by
`src/data/energy/electric-grid.json`, generated from the DOE workbook with
Visayas demand and NIR generation rows.

```bash
python3 scripts/import-doe-electric-grid.py ~/Downloads/Electric\ Grid\ Data.xlsx
```

The importer validates the expected Visayas row count, NIR facility count, and
summary MW totals before writing JSON.

## Bacolod annual-budget ingestion

The Transparency `City Budget` card is backed by the four Annual Budget Report
(ABR) workbooks published by the [Bacolod Full Disclosure Policy](https://bacolodcity.gov.ph/full-disclosure-policy/).
The runtime dataset contains comparable proposed-budget totals plus the six
largest individual appropriation lines for each report year; it never loads a
workbook in the browser. These figures are proposed appropriations, not a
record of actual spending. The item-level rows are labelled as budget objects,
not departments or completed projects.

```bash
pip install -r requirements.txt
python3 scripts/import-annual-budgets.py ~/Downloads
python3 scripts/import-annual-budgets.py ~/Downloads --check
```

The importer records source URLs, worksheet row coordinates, and SHA-256
hashes. It fails if total receipts and total expenditures do not reconcile,
or if the five published expenditure classes do not add up to the total.

### Search index: `generate-search-index.ts`

Run automatically by `bun run build` after Vite finishes. Indexes the site for
Orama full-text search; not related to fuel prices.
