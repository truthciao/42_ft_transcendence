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

# Files that are not part of user-facing application UI.
# They are intentionally excluded from the audit.
RG_GLOBS=(
  --glob '*.tsx'
  --glob '!**/ui/**'
  --glob '!**/pages/dev/**'
)

# --------------------------------------------------
# 1. Hardcoded JSX text
# --------------------------------------------------

echo "1. Hardcoded JSX text"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
    '<(h[1-6]|p|span|div|label|button|a|li|option|td|th)[^>]*>[[:space:]]*[A-Za-z][^<{]*[A-Za-z][^<{]*</' \
    "$WEB_SRC" \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded JSX text found."
fi

# --------------------------------------------------
# 1b. Hardcoded JSX string expressions
#
# Detect:
#   {'Loading...'}
#   {"Loading..."}
#   {condition ? 'Loading...' : 'Retry'}
#
# Ignore:
#   variant="secondary"
#   size="sm"
#   type="submit"
#   className="..."
#   route strings
#   identifiers / enum-like values
# --------------------------------------------------

echo
echo "1b. Hardcoded JSX string expressions"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
    '\{[[:space:]]*["'\''][A-Za-z][^"'\'']*["'\''][[:space:]]*\}' \
    "$WEB_SRC" \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded JSX string expressions found."
fi

# --------------------------------------------------
# 1c. Hardcoded strings inside ternary JSX expressions
#
# Detect:
#   {loading ? 'Verifying...' : 'Verify'}
#
# This is intentionally separate from 1b because the
# string is part of an expression rather than the
# entire expression.
# --------------------------------------------------

echo
echo "1c. Hardcoded JSX ternary strings"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
    '\{[^{}?]*\?[[:space:]]*["'\''][A-Za-z][^"'\'']*["'\''][[:space:]]*:[[:space:]]*["'\''][A-Za-z][^"'\'']*["'\'']' \
    "$WEB_SRC" \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded JSX ternary strings found."
fi

# --------------------------------------------------
# 2. Hardcoded placeholders
# --------------------------------------------------

echo
echo "2. Hardcoded placeholders"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
    'placeholder="[^"]*[A-Za-z][^"]*"' \
    "$WEB_SRC" \
    --glob '!**/pages/dev/**' \
    | grep -Ev \
      'placeholder="(user@example\.com|example@example\.com|name@example\.com|e\.g\.)' \
    || true
)

if [[ -n "$matches" ]]; then
  echo "$matches"
  count=$(count_matches "$matches")
  add_issues "$count"
else
  echo "✓ No hardcoded placeholders found."
fi

# --------------------------------------------------
# 3. Hardcoded aria-labels
# --------------------------------------------------

echo
echo "3. Hardcoded aria-labels"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
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

# --------------------------------------------------
# 4. Hardcoded titles
# --------------------------------------------------

echo
echo "4. Hardcoded titles"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
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

# --------------------------------------------------
# 5. Hardcoded toast / alert / confirm messages
# --------------------------------------------------

echo
echo "5. Hardcoded toast / alert / confirm messages"
echo "----------------------------------------"

matches=$(
  rg -n \
    "${RG_GLOBS[@]}" \
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

# --------------------------------------------------
# Summary
# --------------------------------------------------

echo
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