# Performance Case Study — Build Plan

A portfolio project whose entire purpose is to produce **real, defensible performance numbers** you own. The deliverable isn't "an app" — it's a documented before/after that you can walk an interviewer through three levels deep.

The golden rule: **measure, change one thing, measure again, write down the delta.** Never optimize without a number on both sides.

---

## 1. The app to build

**A personal-finance / banking dashboard** — domain-relevant to your fintech targets, and it naturally contains both kinds of performance problems.

Two surfaces, each demonstrating a different half of the performance story:

- **Public landing page** (image- and font-heavy): this is where you get the dramatic Lighthouse-score story — LCP, CLS, image and font optimization. Lighthouse runs per-page, so this page is your headline number.
- **Authenticated dashboard** (data- and JS-heavy): a large transactions table (10,000+ rows), a couple of charts, filters, and a detail drawer. This is where you show architecture — code-splitting, virtualization, rendering strategy, data fetching.

**Stack:** Next.js (App Router) + TypeScript + Tailwind + **your own `practics/ui`** (dogfooding your library is a great signal) + TanStack Table + TanStack Virtual + Recharts + TanStack Query. Mock the data with a local JSON generator or a tool like MSW so it's reproducible.

### Build it badly first — on purpose

The before/after only works if the baseline is genuinely slow. Tag this state as `v0-baseline` in git so you can always prove the starting point. Deliberately include:

- Large unoptimized images (full-size PNG/JPEG, no dimensions set)
- One big JS bundle, no code-splitting; chart library imported eagerly
- The full 10k-row table rendered at once, no virtualization
- Render-blocking web fonts loaded from a CDN `<link>`
- Everything client-rendered, no memoization
- A couple of heavy third-party scripts loaded in `<head>`

Commit, tag `v0-baseline`, measure. That's your "before."

---

## 2. Measurement setup (do this before any optimization)

Tools:
- **Lighthouse** in Chrome DevTools — run **mobile** with throttling (this is what Google scores); also note desktop. Record the Performance score plus FCP, LCP, TBT, CLS, Speed Index.
- **Core Web Vitals**: LCP, INP, CLS (and TTFB as a supporting metric). Use the `web-vitals` npm package to log them in the running app.
- **Bundle analysis**: `@next/bundle-analyzer` — screenshot the treemap so you can show bundle size before/after.
- Run each Lighthouse measurement **3 times and take the median** — single runs are noisy.

Capture the baseline numbers into the README table (section 4) before touching anything.

---

## 3. Optimization checklist — in order

Work top to bottom. Each pass is its own commit/PR with a before→after number. The order is roughly highest-impact-first and mirrors how you'd reason about it out loud in an interview.

**1. Images (biggest LCP lever)**
Switch to `next/image`; serve AVIF/WebP; set explicit `width`/`height` to eliminate CLS; add `priority` to the hero image; lazy-load everything below the fold. *Expect:* large LCP and CLS improvement.

**2. Rendering strategy**
Make the landing page static (SSG/ISR). Use Server Components for the dashboard shell so less JS ships to the client; stream the slow parts. *Expect:* lower TTFB and LCP, smaller client bundle.

**3. JavaScript / bundle size**
Route-based code-splitting; `dynamic()` import the chart library and the detail drawer so they're not in the initial bundle; tree-shake; remove unused dependencies. Re-run the analyzer. *Expect:* lower TBT and INP.

**4. Third-party scripts**
Move them out of the critical path with `next/script` (`strategy="lazyOnload"` / `afterInteractive`); use a facade for anything embeddable. *Expect:* lower TBT.

**5. Fonts**
Use `next/font` to self-host, preload, subset, and apply `font-display: swap`. *Expect:* removes render-blocking, improves CLS and FCP.

**6. Long lists / large table**
Virtualize the 10k-row transactions table with TanStack Virtual so only visible rows mount. *Expect:* large INP / main-thread improvement; the table becomes interactive instantly.

**7. Re-render hygiene**
Profile with React DevTools; add `React.memo` / `useMemo` / `useCallback` only where the profiler shows wasted renders (don't sprinkle blindly). *Expect:* lower INP on interactions.

**8. Data fetching**
TanStack Query for caching, request deduplication, and prefetching on hover/route-intent; show skeletons instead of spinners. *Expect:* better perceived performance, fewer waterfalls.

**9. Network / caching**
Set sensible cache headers, prefetch likely-next routes, serve static assets from a CDN (Vercel does this for you). *Expect:* faster repeat visits.

**10. Lock it in with a performance budget (the architect move)**
Add **Lighthouse CI** to GitHub Actions with budgets (e.g. fail the build if performance < 90, or LCP regresses past a threshold, or the bundle grows beyond a set KB). This turns performance from a one-off fix into an enforced gate — very few candidates show this, and it reads as lead-level thinking.

---

## 4. README template

Copy this into the repo's `README.md`. Lead with the result — the before/after table is the first thing a recruiter or interviewer should see.

```markdown
# FinDash — Frontend Performance Case Study

A banking dashboard optimized from a deliberately unoptimized baseline,
documenting each change and its measured impact. Built to demonstrate
real-world web performance engineering, not a toy score.

## Result

| Metric (mobile, median of 3) | Before (`v0-baseline`) | After  | Change |
|------------------------------|------------------------|--------|--------|
| Lighthouse Performance       | 00                     | 00     | +00    |
| LCP                          | 0.0s                   | 0.0s   | −00%   |
| INP                          | 000ms                  | 00ms   | −00%   |
| CLS                          | 0.00                   | 0.00   | −00%   |
| TTFB                         | 000ms                  | 000ms  | −00%   |
| Initial JS bundle            | 000 KB                 | 000 KB | −00%   |

[Baseline Lighthouse screenshot] · [Final Lighthouse screenshot]

## Stack
Next.js (App Router), TypeScript, Tailwind, practics/ui, TanStack Table +
Virtual + Query, Recharts.

## Run it
\`\`\`bash
pnpm install
pnpm dev
# Reproduce the baseline:
git checkout v0-baseline
\`\`\`

## How to reproduce the measurements
Lighthouse, mobile preset, throttling on, median of 3 runs. Core Web Vitals
logged via the `web-vitals` package (see console).

## Optimization log

Each entry is a single commit/PR with a before→after measurement.

### 1. Image optimization
**What:** next/image, AVIF/WebP, explicit dimensions, priority hero, lazy below-fold.
**Why:** the hero image was the LCP element and was shipping at full resolution.
**Impact:** LCP 0.0s → 0.0s, CLS 0.00 → 0.00.

### 2. Rendering strategy
**What:** ...
**Why:** ...
**Impact:** ...

<!-- one section per optimization pass -->

## Key learnings & tradeoffs
- What gave the biggest win, and why.
- One thing that *didn't* help as expected, and what you learned.
- A tradeoff you made (e.g. SSG vs freshness of data).
```

---

## 5. Why this works in interviews

Every row in that table is a question you *want* asked. "How did you get LCP down?" → you point to the image pass and explain why the hero was the LCP element. "What's INP and how did you improve it?" → the virtualization and re-render passes. And because you kept the `v0-baseline` tag, you can prove the before state — there's nothing to doubt.

Do passes 1–6 and pass 10 first; that's enough for a complete, defensible story. The rest is polish you can add over time.
