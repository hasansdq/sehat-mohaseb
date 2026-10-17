# Validation — 2026-10-17

Validated the updated article editor and image upload deployment in the available Linux/Node.js environment:

- Locked dependency installation and Prisma Client generation.
- Production Next.js build, TypeScript validation, ESLint, shell syntax.
- Prisma CLI with development dependencies pruned.
- Fresh SQLite startup; repeated seed preserves edited content and administrator password.
- Public homepage/API and authenticated administrator dashboard.
- Restored administrator backup API/page; backup SQLite integrity_check passes.
- Missing JWT secret blocks startup.
- Production image upload requires administrator authentication.
- Uploaded PNG is re-encoded and immediately readable at /api/uploads/… .
- Existing /uploads/… links work through an internal rewrite, including files added after server startup.
- ETag revalidation; symlink and traversal attempts are rejected.
- SVG uploads, fake WebP/WAV, corrupt PNG and oversized requests are rejected.
- A synthetic OpenAI API key stored in the test database is absent from the public settings response.

The runtime tests passed again after pruning development dependencies. Test databases, passwords and images are disposable; no live provider credentials are used.

Limitations: Docker daemon unavailable, so the Alpine image itself was not built/run here. Interactive editor typing/undo and live AI provider calls require verification after deployment. Existing Docker volumes and database schema are preserved. Use deploy.sh backup before updating.
