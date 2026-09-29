<img width="1280" height="200" alt="Github-Banner_spot" src="https://github.com/user-attachments/assets/bec5a984-2f1f-44e7-b50d-cc6354d823cd" />

# 🖥️ SPOT Frontend

This repository contains the **interactive map UI** for the SPOT system.  
It allows users to enter natural language queries, see results visualized on a Leaflet map, and explore location matches with external map integrations.

---

## 🚀 Quickstart

### Installation

This project uses **pnpm** (pinned via `packageManager`) and the Node version in
`.nvmrc`. Clone the repository, then:

```bash
nvm use
pnpm install
```

### Usage

```bash
pnpm dev        # start the dev server
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint . (use lint:fix to autofix)
```

`predev` and `prebuild` copy the maplibre worker into `public/maplibre/`; see
[scripts/copy-maplibre-worker.mjs](scripts/copy-maplibre-worker.mjs) for why.

### Known lint debt

`pnpm lint` is green: it reports **0 errors** and ~83 warnings. The warnings are
pre-existing issues that were invisible while linting was broken, kept visible
rather than silenced so CI can fail on *new* problems. Worth working off:

| Count | Rule | Note |
| ----: | ---- | ---- |
| 27 | `@typescript-eslint/no-explicit-any` | mostly store interfaces and API payload types |
| 20 | `react-hooks/*` (`set-state-in-effect`, `refs`, `purity`, `use-memo`, `immutability`) | correctness rules from the React Compiler ruleset; some may be real re-render bugs |
| 15 | `@typescript-eslint/no-unused-vars` | |
| 12 | `react-hooks/exhaustive-deps` | |

Fixing a category should also promote its rule back to `error` in
[eslint.config.mjs](eslint.config.mjs).

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill it in, or pull the real values with
`vercel env pull .env.local`.

### Backend services

| Variable | Description |
|----------|-------------|
| `NLP_API` | Base URL of the [Central NLP API](https://github.com/dw-innovation/kid2-spot-central-nlp-api) (sentence → IMR). |
| `NLP_MODEL` | Model key sent to the NLP API (e.g. `llmhub`, `t5`). |
| `OSM_API` | Base URL of the [OSM Query API](https://github.com/dw-innovation/kid2-spot-osm-query-api) (run/validate a Spot query). |
| `ENVIRONMENT` | Runtime environment forwarded to the NLP API (`development`, `production`). |
| `MONGODB_URI` | MongoDB connection string for saved sessions and error reports. |
| `MONGODB_DBNAME` | MongoDB database name. |
| `MAPTILER_KEY` | MapTiler key used by the `/api/geocode` route. |

### Authentication

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | NextAuth signing secret. |
| `NEXTAUTH_URL` | Canonical URL of the deployment (NextAuth). |
| `CREDENTIALS` | Static test accounts, `"user1:pass1;user2:pass2"`. |
| `APP_SALT` | Salt used to pseudonymise usernames before they reach the backends. |
| `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID` | Azure AD provider. |
| `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET` | GitHub provider. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google provider. |
| `HTTP_BASIC_AUTH` | Optional `"user:pass"` basic-auth gate for the whole site (see `src/proxy.ts`). |

### Client (`NEXT_PUBLIC_*`, inlined at build time)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL the browser calls back into (defaults to `http://localhost:3000`). |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used in share links and metadata. |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment shown in the UI; gates production-only menu items. |
| `NEXT_PUBLIC_VERSION` | Version string displayed in the header. |
| `NEXT_PUBLIC_MAINTENANCE` | Set to show the maintenance dialog instead of the app. |
| `NEXT_PUBLIC_PMTILES_URL` | URL of the Protomaps `.pmtiles` basemap archive (requires CORS + range requests). |
| `NEXT_PUBLIC_PROTOMAPS_FLAVOR` | Basemap flavor: `light`, `dark`, `white`, `grayscale`, `black`. |
| `NEXT_PUBLIC_PROTOMAPS_LANG` | Basemap label language (e.g. `en`, `de`). |
| `NEXT_PUBLIC_TOMTOM_KEY` | TomTom key for the satellite tile layer. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key for the Street View pane. |
| `NEXT_PUBLIC_NOMINATIM_API` | Nominatim endpoint for address search. |
| `NEXT_PUBLIC_TAG_INFO_API` | taginfo endpoint used for OSM tag autocomplete. |
| `NEXT_PUBLIC_MATOMO_URL`, `NEXT_PUBLIC_MATOMO_SITE_ID` | Matomo analytics. |

---

## 🔑 Features

- Leaflet-based map viewer with OSM, satellite, and vector tile layers
- Natural language query input
- Session saving & restoring (via MongoDB)
- Integrations with:
  - Google Maps & Street View
  - OpenStreetMap
  - Export to GeoJSON / KML

---

## 🧩 Part of the SPOT System

The frontend communicates with:
- [`central-nlp-api`](https://github.com/dw-innovation/kid2-spot-central-nlp-api) — to convert NL to structured query
- [`osm-query-api`](https://github.com/dw-innovation/kid2-spot-osm-query-api) — to visualize results on the map

This is the main user-facing module.

---

## 🔗 Related Docs

- [Main SPOT Repo](https://github.com/dw-innovation/kid2-spot)
- [Central NLP API](https://github.com/dw-innovation/kid2-spot-central-nlp-api)
- [OSM Query API](https://github.com/dw-innovation/kid2-spot-osm-query-api)

---

## 🙌 Contributing

We welcome contributions of all kinds — from developers, journalists, mappers, and more!  
See [CONTRIBUTING.md](https://github.com/dw-innovation/kid2-spot/blob/main/CONTRIBUTING.md) for how to get started.
Also see our [Code of Conduct](https://github.com/dw-innovation/kid2-spot/blob/main/CODE_OF_CONDUCT.md).

---

## 📜 License

Licensed under [AGPLv3](../LICENSE).
