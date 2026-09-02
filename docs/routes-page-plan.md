# Routes Page Plan

> **Status: deferred.** This is a product-research document, not an implemented
> BetterBacolod feature. There is no published routes dataset or route-finder
> page in the repository. Do not present these proposed routes or schedules as
> current public transport information.

## Goal

Build the Bacolod routes page so it is useful with partial data, clear about its coverage, and easy to expand as routes are verified.

## Why this is deferred

The earlier route-finder concept had data too thin for a public page:

- 1 route: Bata-Libertad
- 4 stops
- 7 landmarks
- no visible coverage/confidence model
- a route `schedule` shape mismatch between YAML and TypeScript usage

That makes the page feel more complete than the underlying data really is.

## Product Direction

Ship the page as a growing transport guide, not as a fully complete route planner on day one.

The first public version should:

- show a clear beta/limited coverage notice
- show which routes are included
- let users search known landmarks and stops
- return direct and transfer route suggestions when data supports them
- make it easy for locals to submit corrections or missing stops

## Route Data Model

Each route should carry enough metadata to explain reliability and source quality.

```yaml
routes:
  - id: bata-libertad
    name: Bata - Libertad
    shortName: Bata-Libertad
    color: "#2563eb"
    status: verified
    source:
      label: Bacolod LPTRP / local validation
      url: https://bacolodcity.gov.ph/updated-routes-under-the-local-public-transport-route-plan-lptrp/
      checkedAt: "2026-05-31"
    schedule:
      start: "05:00"
      end: "21:00"
      frequency: Every 5-10 minutes
    fareNotes: Fare varies by distance; confirm with operator.
    reversible: true
    stops:
      - id: bata-terminal
        name: Bata Terminal
        landmark: bata-terminal
        coordinates:
          latitude: 10.6720
          longitude: 122.9630
    transferPoints:
      - bacolod-public-plaza
      - libertad-terminal
```

Recommended route statuses:

- `verified`: checked against an official source or trusted local validation
- `community`: submitted or known locally, but not fully verified
- `draft`: incomplete route shape used for internal planning only

## Initial Route Batches

Start with routes that create useful transfer coverage across downtown, Central Market, Libertad, Shopping/La Salle, and major barangay corridors.

Batch 1:

- Bata-Libertad
- Alijis-Central Market
- Fortune Towne-Central Market
- Homesite-Central Market
- Shopping-Libertad-USLS
- Shopping-Libertad-San Agustin
- Taculing-Central Market
- Banago-Libertad
- Handumanan-Mansilingan-Libertad

Batch 2:

- Tangub-South Capitol Road
- Shopping-Northbound Terminal
- Airport Subdivision-South Capitol Road
- Granada-Burgos
- Pepsi-Bata-BCGC
- Mansilingan-Central Market via City Heights
- San Dionisio-Central Market

## Page Features

Minimum useful version:

- searchable origin and destination
- direct route result
- transfer route result
- route directory
- route coverage list
- confidence/status badge per route
- no-result state that suggests nearby known transfer points

Good next version:

- stop and landmark detail pages
- "report correction" link
- source and last-checked metadata
- route coverage map
- common destinations shortcuts such as SM, Plaza, Libertad, Central Market, BCGC, USLS, and Robinsons

## Ranking Rules

When multiple route options exist, rank them by:

1. Direct route
2. Fewer transfers
3. Fewer stops
4. Higher verification status
5. More recently checked source

## Contribution Workflow

Add `content/routes/README.md` when route data lands. It should include:

- route YAML template
- stop YAML template
- coordinate guidance
- status definitions
- source requirements
- examples of acceptable local validation notes

## Sources To Curate

Primary:

- Bacolod City Government LPTRP route announcements
- LTFRB / DOTr route references when available
- City ordinances and transport planning documents

Secondary:

- local news reports identifying awarded/active routes
- operator/cooperative route posts
- community confirmations, marked as `community`

## Merge Readiness

The routes page should not be merged as a general-purpose route finder until:

- the `schedule` schema mismatch is fixed
- at least Batch 1 routes are represented
- route coverage is visible in the UI
- incomplete or unverified routes are clearly labeled
- `bun run lint` and `bun run build` pass
