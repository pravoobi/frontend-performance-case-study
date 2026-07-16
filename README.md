# FinDash — Frontend Performance Case Study

A banking dashboard optimized from a **deliberately unoptimized baseline**, documenting each change and its measured impact. Built to demonstrate real-world web performance engineering, not a toy score.

The rule for every change: **measure, change one thing, measure again, write down the delta.** The starting point is preserved as the `v0-baseline` git tag, and every optimization is one commit with its numbers in the commit message.

v0-baseline (un optimized before): https://frontend-performance-case-study-git-baseline-pravoobis-projects.vercel.app/
Optimized (optimized after): https://frontend-performance-case-study-iota.vercel.app/

## Result

Mobile Lighthouse, throttled, median of 3 runs. Before and after were measured back-to-back in the same session on the same machine (Lighthouse numbers on a developer machine drift with ambient load, so cross-session comparisons are not honest — see *Methodology*).

### Landing page `/`

| Metric | Before (`v0-baseline`) | After | Change |
|---|---|---|---|
| Lighthouse Performance | 52 | 88 | **+36** |
| LCP | 14.1s | 3.3s | **−77%** |
| FCP | 2.8s | 0.8s | −71% |
| Total Blocking Time | 642ms | 240ms | −63% |
| Speed Index | 4.5s | 0.8s | −82% |
| Image transfer | 23.1MB | 216KB | **−99%** |
| JS transfer | 466KB | 417KB | −11% |

### Dashboard `/dashboard` (10,000-row transactions table)

| Metric | Before (`v0-baseline`) | After | Change |
|---|---|---|---|
| Lighthouse Performance | 25 | 54 | **+29** |
| Total Blocking Time | 11,551ms | 695ms | **−94%** |
| FCP | 7.6s | 1.7s | −78% |
| Speed Index | 19.5s | 3.6s | −82% |
| LCP | 16.8s | 14.2s | −15%* |
| Search while typing | froze the tab for seconds | instant | — |

\* Dashboard LCP is pinned by the intentionally huge 1.8MB transactions payload the table downloads (it exists to make the virtualization story real). The durable fix — serving a small first page of rows — is listed under future work.

CLS is ~0 in both states: the baseline's undimensioned images sit below the mobile fold, so their late load never shifted visible content. Explicit dimensions via `next/image` lock that in rather than fix a measured problem.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · [@practics/ui](https://www.npmjs.com/package/@practics/ui) (my own component library) · TanStack Table + Virtual + Query · Recharts · web-vitals

## Run it

```bash
pnpm install
pnpm dev
# Reproduce the baseline:
git checkout v0-baseline
```

## Methodology

```bash
pnpm build && pnpm start
pnpm measure <label>              # Lighthouse (mobile, throttled) ×3 → per-metric medians
bash scripts/sweep.sh <tmpdir>    # re-measure every checkpoint back-to-back
```

- Medians of 3 runs; archived Lighthouse HTML reports for every pass live in `docs/measurements/`, medians in `docs/measurements/results.json`.
- The dataset is generated with a seeded PRNG (`lib/transactions.ts`), so every machine measures the same 10,000 transactions.
- Cross-session Lighthouse numbers on a developer machine are not comparable (ambient load drifts, and Lighthouse's CPU multiplier amplifies it). The headline table uses the `final-baseline` / `final` labels, measured in one session; `sweep-*` labels re-measure every pass back-to-back for consistent pass-to-pass deltas.
- Core Web Vitals are also logged to the console at runtime via the `web-vitals` package.

## The deliberately bad baseline (`v0-baseline`)

- 23.1MB of full-resolution PNG photos, no dimensions, no lazy-loading
- Render-blocking Google Fonts stylesheet and three synchronous CDN scripts in `<head>`
- Everything client-rendered; moment.js and lodash shipped to the browser
- All 10,000 table rows mounted at once — ~60,000 DOM nodes; every keystroke re-rendered all of them
- Data fetched on mount with a spinner; aggregates recomputed on every render

## Optimization log

Each pass is one commit with the measurement in its message. Pass-to-pass numbers below are from the back-to-back sweep (`sweep-*` labels).

### 1. Images — the biggest LCP lever
**What:** `next/image` with static imports (intrinsic dimensions), AVIF/WebP, responsive `sizes`, `priority` on the hero, lazy-load below the fold.
**Why:** the hero was the LCP element and shipped as an 8.3MB full-resolution PNG.
**Impact:** image transfer 23.1MB → 216KB (−99%); landing LCP 13.7s → 5.7s.

### 2. Rendering strategy
**What:** landing became a pure Server Component (statically generated); the dashboard shell — stat cards and chart series — is computed server-side at build time; only the interactive table remains a client island.
**Why:** nothing on the marketing page needs client interactivity, and the dashboard aggregates don't need to be computed in the browser on every render.
**Impact:** dashboard TBT 10.4s → 4.7s; landing 63 → 70.

### 3. JavaScript / bundle size
**What:** replaced moment.js with hoisted `Intl` formatters and lodash with native reductions (both dependencies removed); patched `@practics/ui` with `sideEffects: false` so it tree-shakes; the detail drawer is `dynamic()`-imported on first row click.
**Why:** ~70KB of gzip for date formatting the platform does natively; the library's barrel export shipped every Radix package on every page.
**Impact:** JS transfer 469KB → 398KB.
**Negative result kept:** `dynamic()`-importing the *charts* was tried and reverted — the split chunk landed in the shared chunk group (recharts started loading on the landing page) and its delayed hydration forced a layout pass after the 10k-row table had mounted, adding a multi-second task. Split what loads on interaction; keep what renders immediately.

### 4. Third-party scripts
**What:** the synchronous `<head>` scripts (stand-ins for analytics/chat embeds) moved to `next/script` with `strategy="lazyOnload"`.
**Why:** they blocked HTML parsing on every page and nothing above the fold used them.
**Impact:** landing TBT 226ms → 83ms (sweep); FCP no longer waits on cdnjs.

### 5. Fonts
**What:** self-hosted Inter + Sora via `next/font` — subsetted woff2, preload, `font-display: swap`, size-adjusted fallback.
**Why:** the render-blocking fonts.googleapis.com stylesheet was the last thing holding up first paint.
**Impact:** landing FCP 2.7s → 0.8s; Speed Index 3.3s → 2.2s.

### 6. Virtualization — the biggest INP lever
**What:** TanStack Virtual mounts only the ~20 visible rows (plus overscan) instead of all 10,000.
**Why:** ~60,000 mounted DOM nodes made every interaction re-render everything and every layout question reflow the world; interactions froze the tab.
**Impact:** dashboard TBT 5.7s → 2.2s (sweep); 11.6s → 0.7s baseline→final same-session. Scrolling and row clicks became instant.

### 7. Re-render hygiene
**What:** `useMemo` on the 10k-row filter, `useDeferredValue` on the search input, `memo()` on the table; columns hoisted to module scope.
**Why:** profiling showed typing re-ran the filter and re-rendered the table per keystroke, and opening the drawer re-rendered the table for no prop change.
**Impact:** load metrics unchanged (expected — this pass targets interactions); search-while-typing is visibly instant.

### 8. Data fetching
**What:** TanStack Query owns the transactions fetch (dedupe + session cache); skeleton rows in the table's real layout instead of a spinner; landing CTAs warm the cache on hover/focus.
**Why:** navigating away and back refetched 1.8MB; the spinner let the layout jump when data arrived.
**Impact:** repeat navigation renders from cache; the page holds its final shape while loading.
**Follow-up fix:** the QueryClientProvider initially sat in the root layout and cost the static landing page ~600ms of TBT — it's now scoped to a dashboard-only layout, and the landing prefetch uses a plain `fetch()` + the browser HTTP cache instead (landing 69 → 88, TBT 834ms → 240ms).

### 9. Network & caching
**What:** `Cache-Control: public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` on the (deterministic) transactions API; Next serves hashed static assets as immutable.
**Why:** repeat visits shouldn't re-download an unchanged 1.8MB payload.
**Negative result kept:** `<link rel="preload" as="fetch">` for the payload was tried and reverted — starting a ~MB download at HTML-parse time competes with render-critical resources on a throttled connection and regressed mobile LCP to ~13s. Preload is for small render-critical resources, not bulk data.

### 10. Performance budget (CI gate)
**What:** Lighthouse CI in GitHub Actions (`lighthouserc.json` + `.github/workflows/lighthouse-ci.yml`): the build fails if the landing page drops below 85 (headroom for runner variance), LCP exceeds 4s, TBT exceeds 500ms, CLS exceeds 0.05, or script weight grows past budget.
**Why:** without an enforced gate, every number above is one refactor away from regressing.

## Key learnings & tradeoffs

1. **The render-blocking chain beat the megabytes.** Cutting 23MB of images moved LCP a lot, but first paint didn't move until the font stylesheet and sync scripts left the critical path — FCP 2.8s → 0.8s came from passes 4–5, not pass 1.
2. **Code-splitting is not free.** Two attempted optimizations measurably hurt: `dynamic()`-importing above-the-fold charts (shared-chunk pollution + late-hydration reflow) and preloading the data payload (bandwidth contention). Both are documented in commits and were reverted for cause. Measure after every change — including the "obviously good" ones.
3. **The DOM is the real bottleneck on interaction.** No amount of memoization fixed the 10k-row table; mounting 60k nodes made every browser operation slow. Virtualization (−94% TBT) did more than every other dashboard pass combined.
4. **Provider placement is an architecture decision.** One line — where `QueryClientProvider` lives — was worth 600ms of TBT on a page that never uses it.
5. **Tradeoffs made:** the dashboard still downloads all 10k rows because instant client-side search over the full history is the product feature being demonstrated; the honest cost is the LCP asterisk above. Chart animations stay off — with a huge DOM they starved the main thread, and the case study values interactivity over flourish.

## Future work

- Paginate `/api/transactions` (small first page + background hydration of the rest) — removes the dashboard LCP asterisk.
- Upstream the `@practics/ui` fixes the case study surfaced: publish the missing `styles` CSS, add `sideEffects: false`, add `"use client"` banners.
- Field data (real-user Web Vitals) via an analytics endpoint instead of console logging.
