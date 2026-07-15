"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

// Measurement infrastructure (not an optimization): logs Core Web Vitals to
// the console so field metrics can be read on any run of the app.
function report(metric: Metric) {
  const value =
    metric.name === "CLS" ? metric.value.toFixed(4) : `${Math.round(metric.value)}ms`;
  console.log(`[web-vitals] ${metric.name}: ${value} (${metric.rating})`);
}

export function WebVitals() {
  useEffect(() => {
    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }, []);

  return null;
}
