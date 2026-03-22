#!/usr/bin/env bash
# Run schema + seed against your Supabase Postgres (from your machine — not from Cursor cloud).
#
# 1) Supabase → Project Settings → Database → Connection string → URI
#    Use "Session mode" or "Transaction" pooler, or direct connection.
#    Replace [YOUR-PASSWORD] with the database password you set when creating the project.
#
# 2) Put your dashboard user's UUID into supabase/seed_demo.sql (v_manager line)
#    before running this script.
#
# 3) From project root:
#    export DATABASE_URL='postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-....pooler.supabase.com:6543/postgres'
#    chmod +x scripts/run-supabase-sql.sh
#    ./scripts/run-supabase-sql.sh
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: set DATABASE_URL to your Supabase Postgres URI (see comments at top of this script)."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql not found. Install: brew install libpq && brew link --force libpq"
  exit 1
fi

echo "Applying schema (supabase/schema.sql)..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/schema.sql"

echo "Applying seed (supabase/seed_demo.sql) — ensure v_manager is set in that file first."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/seed_demo.sql"

echo "Done."
