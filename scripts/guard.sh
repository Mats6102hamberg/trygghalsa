#!/usr/bin/env bash
set -euo pipefail

CFG="repo.guard.json"
if [ ! -f "$CFG" ]; then
  echo "GUARD: Missing $CFG. Stoppar för säkerhet."
  exit 1
fi

PROJECT=$(node -p "require('./$CFG').project")
BRANCH=$(git branch --show-current)
ORIGIN=$(git remote get-url origin 2>/dev/null || true)

ALLOWED=$(node -p "require('./$CFG').allowedBranches.includes('$BRANCH')")
if [ "$ALLOWED" != "true" ]; then
  echo "GUARD: Fel branch: $BRANCH. Tillåtna: $(node -p "require('./$CFG').allowedBranches.join(', ')")"
  exit 1
fi

OK="false"
for token in $(node -p "require('./$CFG').requiredOriginContains.join(' ')"); do
  if echo "$ORIGIN" | grep -qi "$token"; then
    OK="true"
  fi
done

if [ "$OK" != "true" ]; then
  echo "GUARD: Fel origin!"
  echo "GUARD: project=$PROJECT"
  echo "GUARD: origin=$ORIGIN"
  echo "GUARD: kräver att origin innehåller: $(node -p "require('./$CFG').requiredOriginContains.join(', ')")"
  exit 1
fi

BLOCK_DIRTY=$(node -p "require('./$CFG').blockIfDirty")
if [ "$BLOCK_DIRTY" = "true" ]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "GUARD: Working tree är inte clean (blockIfDirty=true)."
    exit 1
  fi
fi

echo "GUARD: OK (project=$PROJECT, branch=$BRANCH, origin=$ORIGIN)"
