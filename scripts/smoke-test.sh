#!/usr/bin/env bash
# Smoke-test for /api/check-in — hits all four branches.
# Usage:
#   ./scripts/smoke-test.sh                          # local dev server
#   ./scripts/smoke-test.sh https://your.vercel.app  # deployed URL

BASE_URL="${1:-http://localhost:3000}"
ENDPOINT="$BASE_URL/api/check-in"

PORTFOLIO='{
  "holdingName": "Canadian Equity ETF",
  "currentValue": 4820.50,
  "dollarLossLockedIn": 631.25,
  "portfolioDayChangePct": -6.2,
  "portfolioWeekChangePct": -8.7,
  "marketDayChangePct": -3.1,
  "userGoal": "first home in ~5 years"
}'

run_test() {
  local label="$1"
  local reason="$2"
  local dismissals="${3:-0}"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "BRANCH: $label"
  echo "REASON: \"$reason\""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  BODY=$(jq -n \
    --arg reason "$reason" \
    --argjson portfolio "$PORTFOLIO" \
    --argjson dismissals "$dismissals" \
    '{userReason: $reason, portfolio: $portfolio, priorDismissalsThisSession: $dismissals}')

  RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$BODY")

  echo "$RESPONSE" | jq .
}

run_test "SUBSTANTIVE" "I'm rebalancing into bonds before I buy a house next year"
run_test "EMOTIONAL"   "everything is dropping and I can't watch this anymore"
run_test "DISMISSIVE"  "just let me sell" 1
run_test "HARDSHIP"    "I need rent money this week"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done. Check branch values and voice above."
