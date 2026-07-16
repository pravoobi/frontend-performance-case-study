#!/usr/bin/env bash
# Re-measure every optimization checkpoint back-to-back in one session so
# the README table compares like with like (ambient machine load drifted
# between the original per-pass measurement sessions).
#
# Usage: bash scripts/sweep.sh <scratch-dir>
set -u

SCRATCH="$1"
L="http://localhost:3000/"
D="http://localhost:3000/dashboard"

# label|commit|urls
CHECKPOINTS=(
  "sweep-v0-baseline|v0-baseline|$L $D"
  "sweep-pass-1|99a6d59|$L"
  "sweep-pass-2|20a767d|$L $D"
  "sweep-pass-3|fb20a48|$L $D"
  "sweep-pass-4|3d4b2e9|$L"
  "sweep-pass-5|faa2202|$L $D"
  "sweep-pass-6|f2780be|$D"
  "sweep-pass-7|a8882bc|$D"
  "sweep-pass-8|7327546|$D"
  "sweep-pass-9|3efac4b|$L $D"
)

for entry in "${CHECKPOINTS[@]}"; do
  IFS='|' read -r label commit urls <<< "$entry"
  echo "=== $label ($commit) ==="
  git checkout -f -q "$commit" || { echo "checkout failed"; exit 1; }
  pnpm install --frozen-lockfile --silent >/dev/null 2>&1
  pnpm build >/dev/null 2>&1 || { echo "build failed for $label"; continue; }
  npx kill-port 3000 >/dev/null 2>&1
  sleep 1
  (pnpm start >/dev/null 2>&1 &)
  sleep 5
  # restore accumulated sweep results before measuring (checkout -f resets it)
  [ -f "$SCRATCH/sweep-results.json" ] && cp "$SCRATCH/sweep-results.json" docs/measurements/results.json
  mkdir -p docs/measurements
  # use the pinned copy of measure.mjs — old checkpoints predate it
  node "$SCRATCH/measure.mjs" "$label" $urls 2>&1 | grep -E "median|·" | grep -v "run "
  cp docs/measurements/results.json "$SCRATCH/sweep-results.json"
done

npx kill-port 3000 >/dev/null 2>&1
git checkout -f -q main
echo "sweep complete -> $SCRATCH/sweep-results.json"
