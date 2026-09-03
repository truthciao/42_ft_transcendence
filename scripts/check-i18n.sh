#!/usr/bin/env bash

set -u

WEB_SRC="apps/web/src"
total_issues=0

echo "========================================"
echo "        i18n audit for web"
echo "========================================"
echo

# --------------------------------------------------
# Helpers
# --------------------------------------------------

count_matches() {
  if [[ -n "${1:-}" ]]; then
    printf '%s\n' "$1" | grep -c .
  else
    echo 0
  fi
}

add_issues() {
  local count="$1"
  total_issues=$((total_issues + count))
}

# Files that should NOT be audited.
#
# - dev pages are development/showcase content
# - UI primitives contain technical/default labels that are
#   intentionally handled at the component level
RG_GLOBS=(
  '--glob' '*.tsx'
  '--glob' '!**/pages/dev/**'
  '--glob' '!**/components/ui/**'
  '--glob' '!**/*.test.tsx'
  '--glob' '!**/*.spec.tsx'
)

# Run rg with the common file filters.
rg_filtered() {
  rg "${RG_GLOBS[@]}" "$@"
}

# --------------------------------------------------
# 1. Hardcoded JSX text
# --------------------------------------------------

echo "1. Hardcoded JSX text"
echo "----------------------------------------"

matches=$(
  rg_filtered -n \
    'placeholder[[:space:]]*=[[:space:]]*"[^"{]*[A-Za-z][^"{]*"' \
    "$WEB_SRC" \
    2>/dev/null \
    | grep -Ev \
      'placeholder="(user@example\.com|https?://[^"]*|[0-9]+)"' \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded JSX text found."
fi

echo

# --------------------------------------------------
# 2. Hardcoded placeholders
# --------------------------------------------------

echo "2. Hardcoded placeholders"
echo "----------------------------------------"

matches=$(
  rg_filtered -n \
    'placeholder[[:space:]]*=[[:space:]]*"[^"{]*[A-Za-z][^"{]*"' \
    "$WEB_SRC" \
    2>/dev/null \
    | grep -Ev \
      'placeholder[[:space:]]*=[[:space:]]*"[^"]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"' \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded placeholders found."
fi

echo

# --------------------------------------------------
# 3. Hardcoded aria-labels
# --------------------------------------------------

echo "3. Hardcoded aria-labels"
echo "----------------------------------------"

matches=$(
  rg_filtered -n \
    'aria-label[[:space:]]*=[[:space:]]*"[^"{]*[A-Za-z][^"{]*"' \
    "$WEB_SRC" \
    2>/dev/null \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded aria-labels found."
fi

echo

# --------------------------------------------------
# 4. Hardcoded titles
# --------------------------------------------------

echo "4. Hardcoded titles"
echo "----------------------------------------"

matches=$(
  rg_filtered -n \
    'title[[:space:]]*=[[:space:]]*"[^"{]*[A-Za-z][^"{]*"' \
    "$WEB_SRC" \
    2>/dev/null \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded titles found."
fi

echo

# --------------------------------------------------
# 5. Hardcoded toast / alert / confirm messages
# --------------------------------------------------

echo "5. Hardcoded toast / alert / confirm messages"
echo "----------------------------------------"

matches=$(
  rg_filtered -n \
    '(toast\.(success|error|info|warning|loading)|alert|confirm)[[:space:]]*\([[:space:]]*["'\'']' \
    "$WEB_SRC" \
    2>/dev/null \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded toast / alert / confirm messages found."
fi

echo

# --------------------------------------------------
# Summary
# --------------------------------------------------

echo "========================================"

if [[ "$total_issues" -eq 0 ]]; then
  echo "✓ i18n audit passed."
  echo "========================================"
  exit 0
else
  echo "⚠ Found $total_issues potential hardcoded UI string(s)."
  echo "Review the results above."
  echo "========================================"
  exit 1
fi