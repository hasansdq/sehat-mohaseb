# Uploaded workspace deployment — 2026-11-11

Source: user-provided workspace TAR. Preserve its UI, mobile effects, article display, navigation, theme, back-to-top, 404 and structured data features.

Fixes: restore Prisma client defaults/relations compatible with existing application and database; synchronize remark-gfm lockfile; secure image validation and serving with legacy URL rewrites; bounded server-side blog search/pagination while preserving shareable URL filters; validated admin settings; runtime sitemap with production domain fallback. Existing Docker volumes retained.

Validation: production build/TypeScript, lint and production runtime tests for authentication, data preservation, backups, uploads, legacy URLs, traversal, blog pagination and settings. Docker daemon and interactive browser checks unavailable; live AI provider not tested.

The TAR database is intentionally excluded: it contains users and credentials. Its 134 landing blocks, six articles and eight navigation items are not automatically imported. Existing production data stays intact. Code deployment does not transfer edits stored only in that database. Plan a separate selected-content import with a backup; never replace the live database wholesale.


## Header phone and logo correction — 2026-11-11

General settings now includes site.headerPhone. Both desktop and mobile header use it, normalizing Persian/Arabic digits for the tel link. site.logoUrl is now included in the general-tab save payload (previously upload preview changed but Save omitted the key). Logo upload UI matches the 5 MB raster-image API policy and disables Save during upload. Removing the logo clears the header image. Header branding and favicon refresh on window focus; favicon no longer declares all images to be SVG or competes with the original icon link.

Validation: production build, lint, upload runtime regression including save/read/remove of uploaded logo and phone through authenticated settings and public API. Interactive browser and Docker execution not available in this environment.
