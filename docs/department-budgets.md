# 2027 Department Budgets

`/transparency/department-budgets` shows a saved public-data snapshot of DepEd,
DOH, and DSWD from BetterGov's FY2027 House bill explorer. It compares NEP new
appropriations with House Bill 10858 (third reading). These are proposals, not
an enacted GAA, releases, obligations, disbursements, or actual expenditure.

## Refresh

```sh
bun run scripts/import-department-budgets.ts
bun test scripts/tests/department-budgets.test.ts
bun run check
bun run build
```

The importer writes `public/data/department-budgets-2027.json` only after all
three departments validate. It records the upstream build time, retrieval time,
source URLs, and SHA-256 hashes of the downloaded files. It checks the index
again after downloading, reconciles agency totals to the departments, and
reconciles national NEP all-funds amounts. It does not reconcile school children
by adding them to parent division totals: they can be included in those totals.
Review the generated diff before committing. Refresh is manual, not on every
visitor request. The page loads the same-origin snapshot only on its lazy route.

## Source and scope

- Publisher schema and caveats:
  <https://github.com/bettergovph/ai-budget/blob/main/src/lib/hgab-explorer.ts>
- Index: <https://budget-assets.bettergov.ph/hgab/2027/explorer/index.json>
- Department files: append `d/<department-id>.json` to that directory.
- Original DBM NEP publications:
  <https://www.dbm.gov.ph/index.php/2027/national-expenditure-program-fy-2027>
- House/NEP source documents and methodology:
  <https://budget.bettergov.ph/hgab/2027/sources>

Integer pesos are retained without rescaling. Nationwide comparison amounts
exclude automatic appropriations. The national NEP all-funds total is shown
separately with automatic appropriations and any agencies classified elsewhere
in the House bill. Never compare that all-funds NEP amount directly with the
House new-appropriations amount as if they have the same scope.

Only outermost `region` nodes labelled exactly `Negros Island Region (NIR)`
are retained, with their full source hierarchy and expense-line page references.
Bacolod currently means exact `office` nodes labelled `Division of Bacolod City`
inside those NIR branches. It is a DepEd division-office view, not a geographic
search of every department, centrally managed program, or project benefiting
the city. Other departments currently have NIR entries but no such division
identifier. No city allocation is inferred from their regional funding.
Switching departments preserves the selected area unless Bacolod has no division
entries in the target department; it then selects NIR and updates the area label
and URL together. An explicit Bacolod selection still shows the missing-coverage
explanation. Nationwide and NIR selections are not changed on department switches.

Each local activity is counted once at the selected region/division boundary.
Children are shown as included details, never added again to the headline.
National figures come from department/agency fields, not local activity sums.
School lists can be subsidiary/non-implementing lists; preserve their `a` flag
and NEP evidence notes (`q[3]`), including division-contained amounts. Missing
versions on expense lines are labelled as not separately listed, not zero.

BetterGov labels this machine-extracted comparison as under citizen review.
Names, matches, and amounts need checking against source PDFs before citation.
PDF links retain the source's exact document key and physical PDF page; the
printed page can differ. Division/school breakdowns are not claims about actual
spending, project completion, beneficiaries, or a complete city education budget.
