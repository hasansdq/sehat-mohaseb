#!/bin/sh
set -eu
cd "${APP_DIR:-/app}"
: "${JWT_SECRET:?Set JWT_SECRET in .env.docker}"
: "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD in .env.docker}"
[ "${#JWT_SECRET}" -ge 32 ] || { echo "JWT_SECRET must contain at least 32 characters" >&2; exit 1; }
[ "${#ADMIN_PASSWORD}" -ge 12 ] || { echo "ADMIN_PASSWORD must contain at least 12 characters" >&2; exit 1; }
case "$JWT_SECRET $ADMIN_PASSWORD" in *CHANGE_ME*) echo "Replace example secrets before deployment" >&2; exit 1;; esac
export DATABASE_URL="${DATABASE_URL:-file:/app/db/custom.db}"
case "$DATABASE_URL" in file:/*) ;; *) echo "DATABASE_URL must be an absolute SQLite file URL" >&2; exit 1;; esac
DB_FILE="${DATABASE_URL#file:}"
mkdir -p "$(dirname "$DB_FILE")/backups"
# Do not truncate an existing database. Pre-create a new empty SQLite file.
[ -e "$DB_FILE" ] || : > "$DB_FILE"
# No runtime installation or regeneration; fail on unsafe schema changes.
node node_modules/prisma/build/index.js db push --skip-generate
node prisma/seed.cjs
exec "$@"
