#!/usr/bin/env bash
# Load .env.local before starting the dev server.
# Required because Turbopack inlines process.env vars at compile time
# using the shell environment — not Next.js's runtime env loading.
# Claude Code sets ANTHROPIC_API_KEY="" in the shell, which gets inlined
# as empty string unless we override it here first.
set -a
# shellcheck source=../.env.local
source "$(dirname "$0")/../.env.local"
set +a
exec next dev "$@"
