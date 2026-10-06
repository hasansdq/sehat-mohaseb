# Validation — 2026-10-06

Passed in the available Linux/Node.js environment:
- Production Next.js build with TypeScript validation enabled.
- ESLint; entrypoint and deployment shell syntax.
- Production dependencies pruned; bundled Prisma CLI starts without runtime installation.
- Fresh SQLite schema and seed via the actual entrypoint.
- Repeated seed preserves edited services and administrator password.
- Homepage and public API: HTTP 200; unauthenticated admin API: HTTP 401.
- Administrator login and authenticated dashboard: HTTP 200.
- Administrator backup endpoint; SQLite integrity_check on the backup: ok.
- Missing JWT secret stops startup.

Limitations:
- Docker daemon unavailable here; Alpine image build/run and DirectAdmin routing must be verified on the VPS.
- Real AI provider credentials were not supplied; live AI calls were not tested.
- Full npm dependency tree makes the image larger than minimal standalone, intentionally keeping Prisma CLI dependency packaging reliable.
- db push rejects unsafe changes; larger production schema changes still require a planned migration and backup.
