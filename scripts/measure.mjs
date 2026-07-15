// Lighthouse measurement harness.
//
// Usage: node scripts/measure.mjs <label> [url ...]
//   e.g. node scripts/measure.mjs v0-baseline
//
// Runs Lighthouse (mobile emulation, default throttling) RUNS times per URL
// against a production server on :3000, records the per-metric median into
// docs/measurements/results.json, and keeps the HTML report of the median
// run (by performance score) as the visual artifact.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const RUNS = 3;
const label = process.argv[2];
const urls = process.argv.length > 3
  ? process.argv.slice(3)
  : ["http://localhost:3000/", "http://localhost:3000/dashboard"];

if (!label) {
  console.error("Usage: node scripts/measure.mjs <label> [url ...]");
  process.exit(1);
}

const outDir = path.join("docs", "measurements", label);
mkdirSync(outDir, { recursive: true });

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

function collect(url, slug) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) {
    const base = path.join(outDir, `${slug}-run${i}`);
    console.log(`  run ${i}/${RUNS}...`);
    try {
      execFileSync(
        "npx",
        [
          "lighthouse",
          url,
          "--only-categories=performance",
          "--output=json,html",
          `--output-path=${base}`,
          '--chrome-flags=--headless=new',
          "--quiet",
        ],
        { stdio: "ignore", shell: process.platform === "win32" },
      );
    } catch (err) {
      // chrome-launcher's temp-profile cleanup is flaky on Windows and can
      // fail the process after the report was already written — only treat
      // this as fatal if the report is actually missing.
      if (!existsSync(`${base}.report.json`)) throw err;
    }
    const report = JSON.parse(readFileSync(`${base}.report.json`, "utf8"));
    if (report.runtimeError) {
      throw new Error(`Lighthouse runtime error on ${url}: ${report.runtimeError.message}`);
    }
    const a = report.audits;
    const requests = a["network-requests"].details.items;
    runs.push({
      score: Math.round(report.categories.performance.score * 100),
      fcpMs: a["first-contentful-paint"].numericValue,
      lcpMs: a["largest-contentful-paint"].numericValue,
      tbtMs: a["total-blocking-time"].numericValue,
      cls: a["cumulative-layout-shift"].numericValue,
      speedIndexMs: a["speed-index"].numericValue,
      ttfbMs: a["server-response-time"].numericValue,
      jsTransferKb:
        requests
          .filter((r) => r.resourceType === "Script")
          .reduce((sum, r) => sum + (r.transferSize ?? 0), 0) / 1024,
      imageTransferKb:
        requests
          .filter((r) => r.resourceType === "Image")
          .reduce((sum, r) => sum + (r.transferSize ?? 0), 0) / 1024,
      totalTransferKb:
        requests.reduce((sum, r) => sum + (r.transferSize ?? 0), 0) / 1024,
    });
  }

  // Keep only the HTML report of the median run by score; drop the rest to
  // keep the repo lean.
  const byScore = runs
    .map((r, i) => ({ score: r.score, i: i + 1 }))
    .sort((a, b) => a.score - b.score);
  const medianRun = byScore[Math.floor(byScore.length / 2)].i;
  for (let i = 1; i <= RUNS; i++) {
    const base = path.join(outDir, `${slug}-run${i}`);
    if (i === medianRun) {
      // rename to a stable artifact name
      const html = readFileSync(`${base}.report.html`);
      writeFileSync(path.join(outDir, `${slug}.report.html`), html);
    }
    rmSync(`${base}.report.html`, { force: true });
    rmSync(`${base}.report.json`, { force: true });
  }

  const med = {};
  for (const key of Object.keys(runs[0])) {
    med[key] = Number(median(runs.map((r) => r[key])).toFixed(key === "cls" ? 4 : 1));
  }
  return { medians: med, runs };
}

const resultsPath = path.join("docs", "measurements", "results.json");
const results = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, "utf8"))
  : {};
results[label] = { measuredAt: new Date().toISOString(), pages: {} };

for (const url of urls) {
  const slug = new URL(url).pathname === "/" ? "landing" : new URL(url).pathname.slice(1).replace(/\//g, "-");
  console.log(`\n${label} · ${url}`);
  const { medians, runs } = collect(url, slug);
  results[label].pages[slug] = { url, medians, runs };
  console.log(
    `  median: score ${medians.score} · FCP ${(medians.fcpMs / 1000).toFixed(1)}s · ` +
      `LCP ${(medians.lcpMs / 1000).toFixed(1)}s · TBT ${medians.tbtMs}ms · ` +
      `CLS ${medians.cls} · SI ${(medians.speedIndexMs / 1000).toFixed(1)}s · ` +
      `JS ${Math.round(medians.jsTransferKb)}KB · IMG ${Math.round(medians.imageTransferKb)}KB`,
  );
}

writeFileSync(resultsPath, JSON.stringify(results, null, 2) + "\n");
console.log(`\nSaved medians to ${resultsPath}`);
