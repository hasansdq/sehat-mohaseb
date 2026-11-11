# Uploaded workspace deployment — 2026-11-11

Source: user-provided workspace TAR. Preserve its UI, mobile effects, article display, navigation, theme, back-to-top, 404 and structured data features.

Fixes: restore Prisma client defaults/relations compatible with existing application and database; synchronize remark-gfm lockfile; secure image validation and serving with legacy URL rewrites; bounded server-side blog search/pagination while preserving shareable URL filters; validated admin settings; runtime sitemap with production domain fallback. Existing Docker volumes retained.

Validation: production build/TypeScript, lint and production runtime tests for authentication, data preservation, backups, uploads, legacy URLs, traversal, blog pagination and settings. Docker daemon and interactive browser checks unavailable; live AI provider not tested.

The TAR database is intentionally excluded: it contains users and credentials. Its 134 landing blocks, six articles and eight navigation items are not automatically imported. Existing production data stays intact. Code deployment does not transfer edits stored only in that database. Plan a separate selected-content import with a backup; never replace the live database wholesale.
