#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
service=sehat-mohaseb
case "${1:-help}" in
  build|start|update)
    test -f .env.docker || { echo "Copy .env.docker.example to .env.docker and set secrets" >&2; exit 1; }
    test -f secrets/.z-ai-config || { echo "Create secrets/.z-ai-config with your AI connection settings" >&2; exit 1; }
    if [ "${1}" = update ]; then git pull --ff-only; fi
    docker compose config --quiet
    docker compose up -d --build --wait --wait-timeout 180
    ;;
  stop) docker compose down ;;
  restart) docker compose restart ;;
  logs) docker compose logs -f --tail=100 ;;
  status) docker compose ps ;;
  shell) docker compose exec "$service" sh ;;
  backup)
    mkdir -p backups
    stamp=$(date +%Y%m%d-%H%M%S)
    docker compose exec -T -e BACKUP_STAMP="$stamp" "$service" node -e '
      const fs = require("fs");
      const { PrismaClient } = require("@prisma/client");
      const db = new PrismaClient();
      (async () => {
        try {
          fs.mkdirSync("/app/db/backups", { recursive: true });
          await db.$executeRawUnsafe("VACUUM INTO " + JSON.stringify("/app/db/backups/backup-" + process.env.BACKUP_STAMP + ".db"));
        } catch (e) { console.error(e.message); process.exitCode = 1; }
        finally { await db.$disconnect(); }
      })();'
    container_id=$(docker compose ps -q "$service")
    docker cp "$container_id:/app/db/backups/backup-$stamp.db" "backups/sehat-$stamp.db"
    echo "Backup saved: backups/sehat-$stamp.db"
    ;;
  *) echo "Usage: bash deploy.sh {build|start|update|stop|restart|logs|status|shell|backup}" ;;
esac
