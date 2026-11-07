# Validation — 2026-11-07

Version 12 features merged onto verified commit f65f53f0e9e7785b7c85495fd1a0de3570db4e8e.

- Preserved authenticated, validated image uploads, realpath containment, legacy image rewrites, SVG sandboxing, stable client-only article editor, backup routes and root-scoped ignore rules.
- Added blog pages and editable trust bar/blog settings.
- Implemented bounded server pagination and search, stable category choices and published-only article access. Existing article API consumers still receive `items`.
- ESLint, production Next.js build/TypeScript and shell syntax passed.
- Disposable SQLite production runtime tests passed: fresh startup, repeated seed preserves edits and password, public pages, administrator authentication, backup integrity and missing-secret rejection.
- Upload runtime tests passed: authenticated uploads, immediate image reads, legacy URLs, ETag, symlink/traversal rejection, invalid image and oversized request rejection, legacy SVG sandbox headers, public settings secret filtering.
- Blog runtime tests passed: both page routes, 105 matching articles across pages without duplication, category/search filters, draft isolation, invalid and oversized limit handling.

No database schema, Docker volume names, bind address or production secrets changed. No live server was modified. No environment files, private keys, database contents or uploaded user files are included in this change.

Limitations: Docker is unavailable in this environment, so the Alpine image build and actual VPS health check must be verified during deployment. Interactive browser editing and live AI provider calls were not tested.

## Existing VPS update

Run in the existing installation directory to keep the Compose project/volumes:

```bash
cd /opt/sehat-mohaseb
bash deploy.sh backup && git pull --ff-only && bash deploy.sh build
docker compose ps
curl --fail --show-error http://127.0.0.1:3001/api/public/site
curl --fail --show-error https://sehatmohaseb.com/api/public/site
```

`build` waits for container health. Keep existing `.env.docker` and `secrets/.z-ai-config`. Do not run `docker compose down -v` or delete volumes. The backup command saves the SQLite database, not uploaded images; retain a separate backup of the uploads volume. A domain-only failure after a successful local API check requires checking DirectAdmin proxy/DNS/TLS independently.
