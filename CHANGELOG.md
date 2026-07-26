# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning is [Semantic Versioning](https://semver.org/). **Every feature = one `vX.Y.Z` tag** with its own section below.

## [0.8.1] - 2026-07-26

### Added

- **Documentation site** (NC-57): `docs/index.html` plus a stylesheet, deployed to GitHub Pages by `.github/workflows/pages.yml`. Before this the project had no published documentation — `docs/` held two scratch notes and two screenshots, and the README was three lines and a GIF.

  It covers the overview, an honest project status table (including what does *not* work), quick start with the first-user problem spelled out, the full environment variable reference, architecture and layering, the data model, a complete API reference with the access level of every endpoint, the authentication guarantees, the content and page-builder guide, the roadmap and the tracking process.

  Static HTML and one stylesheet: no framework, no build step, light and dark themes, readable on a phone. `.nojekyll` keeps Pages from running Jekyll over it.

- `.github/scripts/check-anchors.mjs`: the site is one page navigated entirely by anchors, so a renamed heading silently breaks the sidebar — something `html-validate` does not catch and a reader notices immediately. The Pages workflow validates the markup and then the anchors before deploying.

- README rewritten to say what the project is, what state it is in, and where the documentation lives.

### Verification

`html-validate` passes with zero errors against its default preset — the markup was fixed to conform rather than the rules configured away — and the anchor check resolves all 13 links against 13 ids. Both run in the workflow before the deploy step.

**Needs one manual step**: Settings → Pages → Source = "GitHub Actions". Until that is set the workflow builds and then fails at deploying. Nothing has been deployed yet, so the deploy path has not run.

## [0.8.0] - 2026-07-26

Milestone **M4 · Content and page builder** closed. Content can be created, categorised, published and composed — and a saved layout now survives a reload.

### Added

- **Categories and tags** (NC-41): new `Category` and `Tag` models with a full CRUD API (`/api/category`, `/api/tag`). Slugs are derived from the name when not supplied, and tags named in a content payload are created on the fly, so an editor never has to create a tag before using it.
- **Drafts** (NC-41): `Page.publishedAt`. `GET /api/page` returns only published content to an anonymous caller and everything to an authenticated one, so a draft cannot leak through the public API.
- **Content filters** (NC-41): `?type=`, `?category=`, `?tag=` on `GET /api/page`.
- **Layout persistence** (NC-42): `GET` and `PUT /api/page/:id/layout`. The replacement runs inside a transaction — a half-written layout would render a mixture of two versions. A block whose path is not in the component registry is rejected before it reaches the database, so a layout the renderer cannot draw can never be saved.
- **`Component.position`** (NC-42): a layout has an explicit order now. Previously the blocks came back in whatever order the database chose.
- **Editor screens** (NC-41): `/content` (list, filter by type, delete), `/content/new` and `/content/:id` (title, slug, type, description, category, tags, SEO fields, published flag), all behind the session middleware. Creating content leads straight into the layout editor, since a new page with no blocks renders empty.
- **The page builder edits a real page** (NC-42): `/page-builder?page=<id>` loads the saved layout, tracks changes and writes them back. Its palette is the component registry rather than arbitrary `Component` rows — those are the components the renderer can actually draw.
- 14 more tests (66 total): slug derivation, taxonomy validation, and layout validation including the rejection of unregistered component paths.

### Changed

- **`Page.tags` is no longer a freeform string**: it is a many-to-many relation to `Tag`. Tags can be listed and filtered on now, which the old column could not do. **Breaking for an existing database** — the `tags` column is dropped, so export its contents first if it holds anything worth keeping, then `npx prisma db push`.
- Pages and posts share the `Page` table, told apart by `type`, so they share one slug space and one renderer.
- `loadPage` fetches the blocks of the one page being rendered, in order. It used to read every component in the database and filter them in memory.

### New backlog items

- **NC-58** 🟡 (M5) — the second half of the page builder: per-block settings in the UI (props are stored and rendered, just not editable), image and media handling, and nested blocks. The data model supports nesting; the editor does not.

### Verification

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 pre-existing warning) | ✅ 66 passed | ✅ |

Not verified: no runtime exercise against a live PostgreSQL instance. The queries are checked by the type system and `prisma validate`, not by execution, and the new tables and columns need `prisma db push` before any of this runs.

## [0.7.3] - 2026-07-26

Node runtime aligned on **24** everywhere. This started as a deploy failure — Vercel refused the build outright with `Found invalid or discontinued Node.js Version: "14.x"` — but the repo disagreed with itself about the Node version in three separate places, so pointing Vercel at a newer one would only have moved the problem.

### Changed

- **Node 24 across the whole toolchain** (NC-55): `.github/workflows/ci.yml` (both the `cms` and `admin` jobs), `cms/Dockerfile` (build and runtime stages) and `.devcontainer/`. Before this the devcontainer was on Node 14, CI and Docker on Node 18 — itself EOL — and Vercel on 14.x, so CI was gating on a runtime nobody deploys.
- **`engines.node: "24.x"`** added to `cms/package.json` and `admin/package.json`. Vercel reads `engines` and it takes precedence over the dashboard setting, so the deployed Node version is now declared in git rather than living as invisible project state. It is also what makes a mismatched local Node warn on `npm install`.
- **`cms/Dockerfile` moved from bullseye to bookworm**, and now installs `openssl`. The old comment said Prisma 3 needs OpenSSL 1.1; that is not accurate — Prisma 3.15 publishes a `debian-openssl-3.0.x` engine. What actually breaks is that the `-slim` images ship no `openssl` binary, and Prisma shells out to it to choose an engine: without it the platform resolves to `linux-<arch>-openssl-undefined` and `prisma generate` fails with `Unknown binaryTarget`. Installed in both the build and the runtime stage, since the engine re-resolves its platform at startup. The move was forced anyway — there is no `node:24-bullseye` image.
- **`.devcontainer/` rebased on the official `node:24-bookworm-slim`.** Its old base (`vscode/devcontainers/javascript-node:0-14`) is retired, and the maintained successor family stops at Node 22, so there was no Node 24 devcontainer image to move to. `sudo` and `git` are now installed explicitly because the Microsoft base provided them. `linuxbrew-wrapper` was dropped from Debian bookworm and would have failed the build; the two zsh plugins it existed to install (`zsh-autosuggestions`, `zsh-syntax-highlighting`) come from apt instead, and `.zshrc` sources them from `/usr/share` behind an existence guard rather than from the linuxbrew prefix.

### Verification

| | typecheck | lint | tests | build |
|---|---|---|---|---|
| `cms` | ✅ | ✅ (1 pre-existing warning) | ✅ 52 passed | ✅ |
| `admin` | ✅ | — | — | ✅ |

Container builds were verified by building them, not by reading them:

- `cms/Dockerfile` `--platform linux/amd64` (the only platform `docker-publish.yml` publishes) builds to the `production` stage. Inspecting the resulting image: Node `v24.18.0`, `libquery_engine-debian-openssl-3.0.x.so.node` present in `node_modules/.prisma/client`, `.next/BUILD_ID` present. An earlier attempt without `openssl` failed exactly as described above, which is how the cause was found.
- `.devcontainer/Dockerfile` builds, and the image reports Node `v24.18.0`, npm `11.16.0`, user `node`, working passwordless `sudo`, and both zsh plugin files plus powerlevel10k present.
- The `backlog-sync` parser added in 0.7.2 still passes its 12 tests with the new item, and a dry run reads M6 as 3/9.

Not verified: the host-side `tsc`/lint/test/build ran on Node 23, not 24 — no Node 24 is installed on this machine. Node 24 is exercised inside both container builds, and CI will be the first run of the host path on 24. The Vercel deploy itself has not been re-run.

## [0.7.2] - 2026-07-26

### Added

- **Backlog automation** (NC-56): `.github/scripts/backlog-sync.mjs` and `.github/workflows/backlog-sync.yml`. Until now `BACKLOG.md` was only a file — nothing carried it into GitHub, so none of the tracked work was visible to anyone not reading the repo.

  Each `NC-n` item becomes an issue labelled `backlog` plus a `severity:*` label, filed under the milestone taken from its `## Mn` section; ticking an item closes its issue, unticking reopens it, and a milestone closes once all of its items are done. The `NC-n` id is the key, so the sync is idempotent: unchanged items are not touched, an edited description updates the existing issue instead of opening a second one, and only the labels the script owns are compared, so a label added by hand survives. An issue whose item disappeared from the file is reported and left alone rather than closed.

  Zero dependencies — Node's global `fetch` and the token Actions already provides. It runs on every push that touches `BACKLOG.md`, and the manual trigger defaults to a dry run so the plan can be inspected first. `BACKLOG.md` is never written to.

- 12 parser tests (`node --test`), run in the workflow before each sync since the parser decides what gets written to the tracker. One of them runs against the real `BACKLOG.md`, so the fixture cannot drift away from the file. They caught a first version that split titles on `:` and produced entries like *"NC-52: bootstrap"*.

### Verification

Dry run against the real backlog parses **54 items across 8 milestones** with the expected done/open split (M0 11/11, M0b 0/2, M1 10/10, M2 13/13, M3 3/3, M4 2/4, M5 0/4, M6 1/7). Not verified: no call has been made against the GitHub API — nothing is pushed, so the first real sync will be the first time the write path runs. That is what the dry-run default on the manual trigger is for.

## [0.7.0] - 2026-07-26

Milestone **M3 · Working auth** closed. The session lifecycle is complete on the `cms` side: sign in, stay signed in, recover a lost password, edit your own account.

### Added

- **`POST /api/auth/refresh`** (NC-39): exchanges a refresh token for a fresh access token. Access tokens last 15 minutes, so without this a session simply ended there. The user is re-read from the database on every refresh, so a deleted or demoted account cannot keep renewing its access for the whole refresh window, and an access token presented here is refused.
- **`GET /api/auth/me`** (NC-39, NC-40): the session's user, read from the database rather than from the token claims — a token issued before a role change would otherwise report stale privileges until it expired.
- **Password recovery** (NC-39): `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`, backed by a new `PasswordResetToken` model. Only the SHA-256 hash of a token is stored (a database dump must not be enough to take over an account), tokens are single-use — claimed with a conditional update so two concurrent requests cannot both succeed — and they expire after `PASSWORD_RESET_TTL_MINUTES` (30 by default). Requesting a new link invalidates any outstanding one. The endpoint answers 202 whether or not the address exists, so it cannot be used to enumerate accounts.
- **Rate limiting** (NC-53): fixed-window limiter in `lib/utils/rate-limit.ts` — 10 login attempts per IP per 5 minutes, 5 registrations and 5 reset requests per IP per hour, answering `429` with a `Retry-After` header. Bucketed by IP rather than by username, so an attacker cannot lock a known account out by failing on purpose.
- **`lib/helpers/mailer.ts`**: a `MailTransport` seam with a development-only logging transport. **No real mail provider is configured**; in production the default transport logs an error and drops the message rather than printing a reset link into the logs.
- **Screens** (NC-40): `/profile` (read and update your account, with an empty password field meaning "leave it alone"), `/forgot-password` and `/reset-password`. `/profile` joins `/page-builder` behind the middleware.
- 15 more tests (52 total): the rate limiter's edges — the limit bites, the window reopens, buckets do not bleed into each other — plus the reset-token hashing and the guarantee that the production mail transport never prints the token.

### Changed

- `cms/prisma/schema.prisma`: added the `PasswordResetToken` model and its back-relation on `User`.
- Release numbering: M1 and M2 shipped together in v0.6.0, so M4, M5 and M6 each moved up one minor from the original plan.

### New backlog items

- **NC-54** 🟠 (M5) — sharing the session between `cms` (port 3000) and `admin` (port 4000). The access-token cookie is HttpOnly and scoped to its origin, so it does not travel between the two dev servers. This was part of NC-39, but it needs a topology decision — same-origin multi-zone with admin under `/admin`, or admin holding its own bearer token — and admin has no login screen yet.

### Verification

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 warning) | ✅ 52 passed | ✅ |

Not verified: the new endpoints were not exercised against a live PostgreSQL instance — no database is available here — so the Prisma queries are checked by the type system and by `prisma validate`, not by execution. The `PasswordResetToken` table also needs to reach the database (`prisma migrate dev` or `prisma db push`) before the recovery flow can run.

## [0.6.0] - 2026-07-26

Milestones **M1 · Security** and **M2 · Correct APIs** closed. They shipped together because both rewrite the same request handlers, and splitting them would have meant writing every route twice. All documentation and code comments were also translated to English in this release.

### Security

- **User projection** (NC-1): `publicUserSelect` / `PublicUser` added in `lib/types/user.ts` and used by every read in `userRepo`. The API previously returned the whole row, bcrypt hash included, from `GET /api/user`, `GET /api/user/:id` and `POST /api/auth/register`. `verifyCredentials` is now the only code path that touches the password column.
- **JWT secret** (NC-2): tokens were signed with the hardcoded string `'shhhhh'`. `JWT_SECRET` now comes from the environment through `requireEnv`, which throws when it is absent. It is read lazily, so `next build` does not need production secrets.
- **JWT payload** (NC-3): the token used to carry the entire user row — password hash included — with no expiry, and a JWT is only base64. Claims are now `{sub, username, isAdmin, isStaff}` with a 15-minute default lifetime, plus a separate refresh token tagged `type: 'refresh'` so it cannot be replayed as an access token.
- **Environment dump** (NC-4): `cms/next.config.js` logged `process.env` and `DATABASE_URL` at build time and at boot, so every credential landed in build and container logs. Removed from both apps.
- **Committed credential** (NC-5): `cms/.env.example` carried a live Heroku Postgres connection string; the file now holds documented placeholders. ⚠️ **The credential remains in the git history and must be rotated on the provider** — no code change can undo that.
- **Route guards** (NC-6): `requireAuth` / `requireAdmin` in `lib/helpers/auth.ts`, applied per route. The `user` and `role` endpoints are admin-only; content writes require authentication; content reads stay public. `_middleware.ts` redirects unauthenticated visitors away from `/page-builder`, and its comment states plainly that this is a cookie presence check, not the authorisation decision — the edge runtime cannot verify a JWT signature.
- **Request logging** (NC-7): `console.log("req ", req, "res ", res)` logged headers and cookies, i.e. bearer tokens, in clear text. Replaced by `lib/utils/logger.ts`, which logs identifiers only.
- **Input validation** (NC-8): `lib/utils/validation.ts` added. User creation is admin-only, self-registration is disabled unless `ALLOW_PUBLIC_REGISTRATION=true`, and a public endpoint can never mint an administrator. A user cannot promote themselves through `PATCH /api/user/:id`.
- **Tracked database** (NC-9): `cms/prisma/dev.db` untracked and `*.db` added to `.gitignore`.
- **Dependencies** (NC-10): `jsonwebtoken` 8.5.1 → `^9.0.2`, `axios` 0.21.1 → `^1.12.2`, and `react-scripts@4.0.3` removed from both apps as an unused CRA leftover — it alone accounted for ~1700 transitive packages.

### Fixed

- **Login end to end** (NC-11, NC-12, NC-13): `userRepo.login` returned a bare token string that the handler wrapped as `data`, while the client expected `data.access_token`; the client sent a `FormData` body labelled `x-www-form-urlencoded`, so `req.body` was empty; and wrong credentials threw, producing a 500 with the `errorResponse` branch unreachable. The contract is now `data: { access_token, refresh_token, user }`, the client sends JSON, and bad credentials are a 401.
- **Handlers that never answered** (NC-14): `POST /api/auth/logout`, the empty `handleDELETE` stubs and the catch branch of `api/role/index.ts` left requests hanging until the client timed out. Every branch answers; deletes are soft deletes that set `deletedAt`.
- **Route ids** (NC-15): `[id]` routes read `req.body.id` on GET/DELETE, where there is no body, so every lookup was `parseInt(undefined)` = NaN. `parseId` in `lib/utils/http.ts` reads and validates `req.query.id`.
- **Unsupported methods** (NC-16): `[id]` routes threw, which Next turns into an opaque 500. All routes now answer 405 with an `Allow` header.
- **Silent no-op creates** (NC-17): `POST /api/page` and `POST /api/components` had their create call commented out and answered `200 {}`. Both now validate, create and answer 201.
- **Empty pages** (NC-18, NC-19): the catch-all returned `props: { basePages }` while the component destructured `{ data }`, and derived the slug from `context.req.url` — path plus query string. The home page fetched its data and then rendered a hardcoded list instead. Both now render from the database through a shared `loadPage`, with the slug built from the route segments.
- **Registration email** (NC-20): the username was copied into the email field, which is `@unique`, so the second registration always collided. Email is a validated field of its own and a collision is a 409.
- **Repo layer** (NC-22, NC-23): every repo now exposes create/read/update/delete, returns the affected row and takes a typed patch object. `api/role/index.ts` no longer reaches for `prisma` directly.
- **Component loading** (NC-34): `DynamicComponents` did `import(dbProvidedPath)`, forcing webpack to bundle a require-context and letting data decide which module loads. Components are now resolved through the static allow-list in `components/registry.ts`; the API refuses an unregistered path and the renderer falls back to `NoComponent`.
- **Hardcoded base URL** (NC-28): `BASE_URI` pointed at a Vercel URL with the env read commented out. Both `BASE_URI` and `API_URI` come from the environment.

### Added

- `cms/lib/helpers/auth.ts` — token signing/verification, cookie handling and the route guards.
- `cms/lib/utils/env.ts`, `logger.ts`, `http.ts`, `validation.ts`, `slug.ts` — the shared plumbing the handlers were missing.
- `cms/components/registry.ts` — the renderable-component allow-list.
- `cms/lib/helpers/page-content.ts` — one place that turns a stored page into a component list, shared by the home and catch-all routes.
- **Unit tests** (part of NC-31): jest + ts-jest in `cms/`, 37 tests in `cms/__tests__/` covering the token invariants (a tampered token is rejected, a refresh token is not an access token, a missing secret throws), id parsing, slug building and payload validation. Wired into `ci.yml`.

### Changed

- All documentation (`CLAUDE.md`, `AGENTS.md`, `BACKLOG.md`, `CHANGELOG.md`, `TODO.md`) and every code comment translated to English, matching the project's own language rule. The Italian fallback string in `NoComponent` is now English too.
- `.github/workflows/ci.yml`: added the `npm test` step to the cms job.

### Removed

- `cms/pages/pagebuilder.tsx` (NC-35): a near-identical older copy of `page-builder.tsx`, which is the path the middleware guards.

### New backlog items

- **NC-53** 🟠 — no rate limiting on login and registration; credential stuffing is only slowed by bcrypt. Carved out of NC-8 and scheduled for M3.

### Verification

Run locally against a clean install (`npm ci`), the same sequence CI runs:

| | `npm ci` | `prisma validate` | `prisma generate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ | ✅ | ✅ (1 warning) | ✅ 37 passed | ✅ |
| `admin` | ✅ | — | — | ✅ | ✅ (1 warning) | — | ✅ |

Not verified: no runtime test against a real PostgreSQL instance, so the Prisma queries are checked by the type system and by `prisma validate`, not by execution.

## [0.5.0] - 2026-07-26

Milestone **M0 · Green build** closed: `cms` and `admin` install, typecheck, lint and build. Before this release the project was not even installable.

### Fixed

- **`cms/prisma/schema.prisma`** (NC-24): the `Visit → Page` relation reused `Visit`'s primary key as a foreign key and declared no opposite field on `Page`, so `prisma generate` failed with P1012. Now `Visit.pageId` + `Page.visits Visit[]`, with its own index and a `createdAt`. `@@index([title], map: "title")` replaces the deprecated `name` argument.
- **Mandatory fields missing from creates** (NC-25): `type` in `pagesRepo.create` (default `"page"`) and in `prisma/seed.ts`; `template` and `data` in `componentRepo.create`.
- **Peer dependency conflicts** (NC-50): `npm install` failed with ERESOLVE in both apps. `@popperjs/core` from `~2.10.1` to `^2.11.8` (required by bootstrap 5.3.x), apexcharts pair aligned (`apexcharts@^3.41.0`, `react-apexcharts@~1.5.0`: 1.9 requires apexcharts 4).
- **Broken sass build** (NC-52): `bootstrap: "^5.1.3"` floated to 5.3.x, which moved `$theme-colors-rgb` into `_maps.scss`; the Metronic import sequence in `styles/sass/_init.scss` is the 5.1 one and the build died with `SassError: Undefined variable`. Pinned to `~5.1.3`.
- **`cms/Dockerfile`** (NC-49): rewritten. It started from `node:17.4-stretch` (non-existent tag, archived distro), ran `apt -y install curl` without `apt-get update`, never ran `prisma generate` — the `@prisma/client` postinstall ran before the schema was in the image — and its production stage copied dependencies without the generated client. Now `node:18-bullseye-slim` (OpenSSL 1.1, required by the Prisma 3 engines), `npm ci`, an explicit `prisma generate` and `node_modules/.prisma` copied into the runtime stage.
- **`componentRepo.create`** (NC-21): stored `property: bodyComponent.toString()`, i.e. `"[object Object]"`. Now `JSON.stringify`, as `update` already did.

### Added

- `cms/package-lock.json` (NC-26): `cms/` had no lockfile at all.
- `jest` and its configuration in `packages/core/nextcms` (NC-48), which declared `test:unit: jest` without depending on it.

### Changed

- `admin/package-lock.json` regenerated: the committed one was lockfileVersion 2 and omitted the optional SWC binaries, so `npm ci` produced a tree without `@next/swc-darwin-arm64` and the build failed with *Failed to load SWC binary*.
- `.github/workflows/ci.yml`: `npm ci` with npm cache for both apps now that the lockfiles exist. Removed the `packages` job, which cannot run while NC-51 is open.

### New backlog items

- **NC-51** 🔴 — `@nextcms/nextcms` depends on sibling versions never published to npm (`@nextcms/generators@0.1.4`, `@nextcms/utils@0.1.10`): `npm install` fails with `notarget`, so the published `@nextcms/nextcms@0.1.19` cannot be installed by anyone. Opens milestone M0b.
- **NC-52** — the bootstrap pin described above.

## [0.4.0] - 2026-07-25

### Added

- `.github/workflows/ci.yml`: the repository's first quality gate (NC-29). Three jobs — `cms` (install, `prisma validate`, `prisma generate`, `tsc --noEmit`, lint, build), `admin` (install from lockfile, typecheck, lint, build), `packages` (unit tests for `@nextcms/nextcms`).
- `cms/.eslintrc.json` and `admin/.eslintrc.json` (NC-47): without a per-app config, `next lint` in CI would have started its interactive setup. The root config is not resolvable from the apps because the plugins are installed inside `cms/` and `admin/`.
- `BACKLOG.md`: a six-milestone sequential roadmap (M0 green build → M6 road to 1.0) with the target release of each and a definition of done.

### Changed

- `.github/workflows/codeql.yml` (NC-45): `codeql-action` from v2 (retired by GitHub in January 2025, so the workflow always failed) to v3, language `javascript-typescript`, `security-and-quality` queries, `checkout@v4`.
- `.github/workflows/docker-publish.yml` (NC-46): rewritten. It used `::set-output` — a command GitHub has disabled — plus a hand-rolled bash block for tagging; tagging is now done by `docker/metadata-action@v5`, with current actions and buildx cache.

### Removed

- `.github/workflows/cypress.yml` (NC-30): it ran on every push but the repo has no Cypress tests and no configuration — it built and started `cms/` for nothing. E2E returns with NC-31.

### New backlog items

- NC-45 (CodeQL v2 retired), NC-46 (`::set-output` in docker-publish), NC-47 (per-app ESLint), NC-48 (`jest` not installed in `@nextcms/nextcms` but called by `test:unit`), NC-49 (`cms/Dockerfile` does not run `prisma generate` before the build).

## [0.3.0] - 2026-07-25

### Added

- `CLAUDE.md` and `AGENTS.md`: working rules, architecture, commands and known traps for the repository.
- `BACKLOG.md`: single source of todos with stable `NC-n` ids, populated from the code audit on commit `7ac0299` (44 items across security, API bugs, the Prisma schema, CI, technical debt and features).
- `CHANGELOG.md` (this file) and the **one feature, one tag** rule.

### Changed

- `TODO.md` is now a pointer to `BACKLOG.md`, which becomes the single source of todos.

## [0.2.11] and earlier

Releases predating the changelog: see the git tags (`git tag --sort=-v:refname`) and the history.
