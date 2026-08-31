#!/usr/bin/env bash

set -u

WEB_SRC="apps/web/src"
total_issues=0

echo "========================================"
echo "        i18n audit for web"
echo "========================================"
echo

count_matches() {
  if [[ -n "$1" ]]; then
    printf '%s\n' "$1" | grep -c .
  else
    echo 0
  fi
}

add_issues() {
  local count="$1"
  total_issues=$((total_issues + count))
}

# --------------------------------------------------
# 1. Hardcoded JSX text
# --------------------------------------------------

echo "1. Hardcoded JSX text"
echo "----------------------------------------"

matches=$(
  node scripts/check-i18n.mjs \
    2>/dev/null \
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
  rg -n \
    --glob '*.tsx' \
    'placeholder="[^"]*[A-Za-z][^"]*"' \
    "$WEB_SRC" \
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
  rg -n \
    --glob '*.tsx' \
    'aria-label="[^"]*[A-Za-z][^"]*"' \
    "$WEB_SRC" \
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
  rg -n \
    --glob '*.tsx' \
    'title="[^"]*[A-Za-z][^"]*"' \
    "$WEB_SRC" \
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
  rg -n \
    --glob '*.tsx' \
    '(toast\.(success|error|info|warning|loading)|alert|confirm)\([[:space:]]*["'\'']' \
    "$WEB_SRC" \
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