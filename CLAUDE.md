# CLAUDE.md — NextCMS

**NextCMS** (`github.com/Allan-Nava/NextCMS`, MIT): a headless-ish CMS built on **Next.js 12 + TypeScript + Prisma**, still **WIP**. This is not a workspace monorepo — it is one repo holding three independent things: the public app `cms/`, the `admin/` panel (Next multi-zone), and the `@nextcms/*` npm packages under `packages/` (a CommonJS CLI/framework, Strapi-inspired). Core idea: pages are **data** (`Page` + `Component` tables) and rendering is dynamic through `next/dynamic`, not a hardcoded component tree.

## Working rules (ALWAYS)

- **Every feature = one tagged release `vX.Y.Z`**: a new section in `CHANGELOG.md` (Keep a Changelog) plus `git tag -a vX.Y.Z -m "Release X.Y.Z"`. Bump `minor` for features and behaviour changes, `patch` for fixes and docs. Do it without being asked.
- **Track everything, always**: no untracked work. Anything you do exists as an `NC-n` item in `BACKLOG.md` **before** you start (create it if missing), gets ticked `[x]` once released, and lands in `CHANGELOG.md` with the tag. Every closed item cites its id in the commit (`NC-12: fix login response envelope`).
- **Document what you change**: if a change touches architecture, commands, env vars, the Prisma schema or an API contract, update `CLAUDE.md` and `AGENTS.md` in the same commit. Stale docs mean the work is not finished.
- **Every folder is its own project**: `cms/`, `admin/` and each package under `packages/` have their own `package.json` and lockfile. Run `npm install` and the scripts **inside** the folder, never from the repo root (the root `package.json` has a single dependency and no scripts).
- **Gate before closing**: `npm run lint`, `npm test` and `npm run build` green in the app you touched. `cms` has 154 unit tests and `admin` 18 (jest + ts-jest, node environment), plus 24 tests for the repo scripts under `.github/scripts/`. New logic in `lib/utils/*` or `lib/helpers/*` arrives **with** its test — several of the rules in this file exist because writing the test first exposed the problem.
- **NEVER `git push`** — the user always does it (tags included: they run `git push --follow-tags`). NEVER add `Co-Authored-By` to commits.
- **No secrets** in code, `.env.example`, docs or logs. Credentials live only in `.env` (gitignored).
- **Todos go to `BACKLOG.md`** (single source, stable `NC-n` ids, never reused or renumbered). Do not scatter `TODO:` comments; `TODO.md` is only a pointer.
- **Header block in every new file**: the `File / Project / File Created / Author / Copyright` comment present in every source file is a project convention — reproduce it.
- **Language is English**: code, comments, identifiers, documentation and user-facing output (API messages, UI labels).
- **Do not do major Next/React upgrades without asking**: we are on **Next 12 + React 17** with the `pages/` router. Moving to Next 13+/App Router is a migration, not a bump.

## Commands

```bash
# public app (port 3000)
cd cms && npm ci && npm run dev
npm run build && npm start
npm run lint
npm test

# admin panel (port 4000, served under /admin)
# CMS_ORIGIN is where its /admin/api/* rewrite points, resolved at build time.
cd admin && npm ci && CMS_ORIGIN=http://localhost:3000 npm run dev
npm test

# repo scripts (backlog sync, release notes, engine check)
node --test .github/scripts/*.test.mjs
node .github/scripts/check-engines.mjs
DRY_RUN=1 node .github/scripts/backlog-sync.mjs

# database (schema and client live in cms/)
cd cms
npx prisma validate            # schema is valid
npx prisma generate            # regenerate the client after every schema change
npx prisma migrate dev         # create/apply a migration
npx prisma db seed             # ts-node prisma/seed.ts
npx prisma studio

# npm packages — see NC-51, they are not installable yet
cd packages/core/nextcms && npm run test:unit
npm publish --access public    # publishing @nextcms/* (see docs/NPM.md)
```

## Architecture

- **`cms/`** (`next-cms`) — the public app and the API. Port 3000.
  - `pages/[...index].tsx` — catch-all: `getServerSideProps` resolves the slug from the route segments and hands the data to `DynamicComponents`.
  - `components/DynamicComponents.tsx` — the heart of rendering: each `PageComponent` is resolved through a static allow-list of components and loaded with `next/dynamic`, falling back to `NoComponent`; it recurses into children when `supportNestedComponent` is set. Renderable components live in `components/Elements/` (`Hero`, `Navbar`, `Features`, `Layout1`) and are registered in `components/registry.ts`.
  - Public routes beyond content: `/posts`, `/category/<slug>`, `/tag/<slug>` (paged archives), `/sitemap.xml`, `/robots.txt`, `/feed.xml`. Editor screens: `/content`, `/content/new`, `/content/:id`, `/page-builder?page=<id>`, `/profile`, plus `/login`, `/forgot-password`, `/reset-password`.
  - `pages/api/<entity>/{index,[id]}.ts` — one handler per entity (`page`, `components`, `user`, `role`, `auth`): `switch (req.method)` with a `405` default, no inline DB logic.
  - `lib/helpers/*-repo.ts` — **the only place that talks to Prisma** (`pagesRepo`, `userRepo`, `componentRepo`, `roleRepo`, `entityRepo`). API routes delegate here.
  - `lib/helpers/auth.ts` — token signing/verification, the access-token cookie, and the `requireAuth` / `requireAdmin` guards used by the API routes.
  - `lib/helpers/password-reset.ts` — reset tokens: only their SHA-256 hash is stored, they are single-use and they expire. `lib/helpers/mailer.ts` is the transport seam — **no real mail provider is configured**.
  - `lib/utils/rate-limit.ts` — fixed-window limiter on the auth endpoints. Counters are per process, so behind several instances the limit is per instance.
  - `lib/helpers/page-content.ts` — turns a stored page into what the renderer needs, shared by the home and catch-all routes. `lib/helpers/archive.ts` does the same for the `/posts`, `/category/<slug>` and `/tag/<slug>` listings.
  - `lib/utils/visibility.ts` — `isPubliclyVisible`, the **single** predicate deciding what an anonymous visitor may see. The renderer, the API, the sitemap and the feed all use it; do not reimplement it (`NC-59`).
  - `lib/utils/pagination.ts` — `parsePagination` / `paginationMeta` for every list endpoint (`NC-78`).
  - `lib/utils/redirect.ts` — validates a post-login `?next=` target. `lib/utils/slug.ts` has `slugFromSegments` and `slugify`.
  - `lib/utils/http.ts` (405/400/404/500 helpers, `parseId`), `lib/utils/validation.ts` (payload checks), `lib/utils/env.ts` (`requireEnv` fails fast on a missing secret).
  - `lib/helpers/taxonomy-repo.ts` — categories and tags; `tagRepo.ensureMany` creates tags named in a payload.
  - `lib/types/response/response.ts` — uniform envelope: `successResponse(data, message)` / `errorResponse(error)` with `DEFAULTResponse.OK|KO`.
  - `lib/utils/logger.ts` — levelled logger. Never log request or response objects.
  - `lib/utils/seo.ts` + `components/Seo.tsx` — the page head: title/description fallbacks, canonical, Open Graph, validated JSON-LD, feed discovery. `lib/utils/sitemap.ts` backs `/sitemap.xml` and `/robots.txt`; `lib/utils/feed.ts` backs the Atom feed at `/feed.xml` (posts only, 50 max, 503 without `BASE_URI`).
  - `lib/reducers/` — Redux Toolkit (`auth`, `layout`, `dragAndDrop`) mounted in `store.ts`; the page builder (`components/pagebuilder/`, react-dnd) builds on it.
  - `lib/prisma.ts` — the `PrismaClient` singleton.
- **`admin/`** (`next-admin`) — the panel, `basePath: '/admin'`, port 4000. **No Prisma and no token**: every call goes through `lib/crud/AdminAPI.ts` to a same-origin `/admin/api/*` path that `next.config.js` proxies to the cms, so the HttpOnly cookie travels and there is no CORS (`NC-54`). Screens: dashboard, content overview (read-only, links into the cms editors), users, roles, taxonomies. `src/_metronic` is a vendored theme that is **not** in use — excluded from the typecheck, and adopting it means restoring the packages it imports.
- **`packages/`** — published npm packages, CommonJS, independent of the two Next apps:
  - `core/nextcms` → `@nextcms/nextcms`: the `nextcms` CLI (commander) plus a Strapi-style bootstrap/loader on Koa.
  - `core/utils` → `@nextcms/utils`: env helper, errors, sanitize/visitors (including `remove-password`).
  - `generators/app` → `@nextcms/generate-new`, `generators/generators` → `@nextcms/generators` (plop).
  - `cli/create-nextcms-app`: the `npx create-nextcms-app` scaffolder.
- **Data** — `cms/prisma/schema.prisma`: `Page` (content; `type` tells pages and posts apart, `publishedAt` marks drafts and future-dated schedules, `authorId` the byline, `categoryId` + `tags` the taxonomy), `Component` (one layout block: `parent` = page id, `position` = order), `Category`, `Tag`, `Entity`, `User`, `Role`, `Visit`, `PasswordResetToken`. Provider is **postgresql** through `DATABASE_URL` (the sqlite variant is commented out in the schema). There is no `migrations/` directory: the project has always used `prisma db push`, so a schema change needs to be pushed to the database before the code that depends on it can run.

## Known traps / technical rules

- **The root `Dockerfile` and `Dockerfile-slim` do not build the app** (`NC-27`): the root has neither `next` nor scripts. The real pipeline is `.github/workflows/docker-publish.yml` with context `./cms` and `cms/Dockerfile` → pushed to `ghcr.io`. `Dockerfile-slim` also copies `.next/standalone` and `.npmrc`, but `cms/next.config.js` does not set `output: 'standalone'` and `.npmrc` does not exist: fix it before using it, do not copy it elsewhere. `cms/Dockerfile` has been rewritten and is the good one.
- **`bootstrap` is pinned to `~5.1.3` on purpose** (`NC-52`): the Metronic theme in `styles/sass/_init.scss` uses the Bootstrap 5.1 import sequence, and since 5.3 `$theme-colors-rgb` lives in `_maps.scss` — unpinning breaks the build with `SassError: Undefined variable`.
- **`@popperjs/core` and the apexcharts pair are aligned** so npm can resolve the tree (`NC-50`): do not move them back.
- **Lockfiles must be regenerated from scratch**, not "refreshed": the `admin` one was lockfileVersion 2 and omitted the optional SWC binaries, and regenerating it with `node_modules` already populated inherits the omission. If `@next/swc-*` is missing, `rm -rf node_modules package-lock.json` and reinstall.
- **The `packages/@nextcms/*` packages are not installable** (`NC-51`): they depend on versions of their own siblings that were never published to npm. That is why `ci.yml` has no `packages` job.
- **Auth lives in the API handlers, not in middleware**: `_middleware.ts` runs on the edge runtime, where `jsonwebtoken` cannot verify a signature. Guard routes with `requireAuth`/`requireAdmin` from `lib/helpers/auth.ts`; the middleware only does a cheap cookie presence check for page redirects.
- **Passwords are hashed with `bcryptjs` and tokens signed with `jsonwebtoken` in the repo/auth layer**, never in a handler. `JWT_SECRET` is mandatory: the app fails fast at startup without it.
- **A post-login `?next=` is attacker-controlled** (`NC-54`): validate it with `safeRedirectTarget` (cms) or `safeReturnTo` (admin). Compare parsed origins, never string prefixes.
- **Never return a raw Prisma `User`**: use `publicUserSelect` / the `PublicUser` type so the password hash cannot leak (`NC-1`).
- **List endpoints are paged** (`NC-78`): repos take a `Pagination` and return `{rows, total}`; routes answer with `pagedResponse`. `data` is still the array — do not move it. `perPage` is capped at 100.
- **A content author comes from the session, never the payload** (`NC-79`), and is exposed through a projection narrower than `publicUserSelect`: no email in a public listing.
- **`BASE_URI` is now load-bearing**: it builds canonical URLs, the sitemap and password reset links. A wrong value is visible to search engines, not just internally.
- **Never log a request or response object**: they carry headers and cookies, i.e. tokens. Use `lib/utils/logger.ts`.
- After every `schema.prisma` change run `npx prisma generate`, otherwise the `Prisma.*Input` types used by the repos will not match.
- **The Node version is pinned in five places and they must agree** (`NC-55`): `.github/workflows/ci.yml` (both jobs), `cms/Dockerfile` (build and runtime stages), `.devcontainer/devcontainer.json` (`VARIANT`) and `engines.node` in `cms/package.json` and `admin/package.json`. The current version is **24**. Vercel reads `engines.node` and it **overrides the dashboard setting**, so change it here rather than in the Vercel project — a version that only exists in the dashboard is invisible to everyone. Note there is no Node 24 devcontainer image from Microsoft (that family stops at 22), which is why `.devcontainer/` builds on plain `node:24-bookworm-slim` and installs `sudo`/`git` itself.
- **Prisma needs the `openssl` binary in the image** (`NC-55`, `NC-74`): the `-slim` Node images do not ship it, and Prisma shells out to it to pick a query engine. Without it the platform resolves to `linux-<arch>-openssl-undefined` and `prisma generate` fails with `Unknown binaryTarget`. `cms/Dockerfile` installs it in both stages. Contrary to what the old comment in that file claimed, Prisma is fine on OpenSSL 3 — it publishes a `debian-openssl-3.0.x` engine — so bookworm is not the problem. Since `NC-74` (Prisma 5) a failed detection is a warning rather than a fatal error, but the engine still needs a matching `libssl` to load, so the package is still required. Alpine would be: musl is a different target (`linux-musl`) and needs checking separately.
- The `@nextcms/*` packages declare `engines: node >=12.22.0 <=17.x.x`: they will refuse to install on the Node 24 the apps now use — that is not a bug in the Next apps, it is `NC-51`/`NC-48` territory.

## Roadmap

`BACKLOG.md` defines the milestones. **M0–M6 are sequential**; **M7 is not** — it is the product backlog, picked by need, and ships item by item rather than as one release.

**M0** green build ✅ (`v0.5.0`) → **M1** security ✅ + **M2** correct APIs ✅ (`v0.6.0`) → **M3** working auth ✅ (`v0.7.0`) → **M4** content and page builder ✅ (`v0.8.0`) → **M5** admin, 4/6 (`v0.10.0`) → **M6** road to 1.0, 11/18 (`v1.0.0`). Separately **M0b** (`v0.5.2`) for the npm packages, and **M7** product, 6/18, shipping incrementally (`v0.9.0` and `v0.11.x` so far).

Release numbering drifted from the original plan because M1 and M2 shipped together in `v0.6.0`; each backlog entry records the version it actually landed in. Do not open items from a later sequential milestone until the previous one is closed (all items ticked, CI green, changelog section, tag). **M5 is not closed**: `NC-58` (page builder second half) needs media first, and `NC-76` is a decision.

## Known state

The repo is WIP but no longer broken. **62 of 85 backlog items are closed.** Milestones: M0 build ✅, M1 security ✅, M2 APIs ✅, M3 auth ✅, M4 content and page builder ✅, M5 admin 4/6, M6 road to 1.0 11/18, M7 product 6/18, M0b npm packages 0/2.

What works, and was verified rather than assumed: both apps install, typecheck, lint, test and build; the full session lifecycle (sign in, refresh, recover a password, edit your own account); content and taxonomy CRUD with an author and pagination; layout persistence in the page builder; the public site with SEO head, archives, sitemap, robots and an Atom feed; the admin panel with dashboard, users, roles and taxonomies.

**Nothing has been exercised against a live database.** Every release so far was verified by the type system, `prisma validate` and unit tests — not by a running server. The schema has moved several times since, so a first real run needs `prisma db push`.

Known product gaps worth reading before adding a feature:

- **No public route sets a cache header** (`NC-83`) — every request recomputes the page from the database. The sitemap, robots and feed routes are the only three that cache.
- **Soft-deleted rows have no trash** (`NC-82`): they accumulate where only a database client can see them.
- **The 404 is not authorable** (`NC-81`), and there is no draft preview (`NC-67`).
- **`Role` grants nothing** (`NC-63`): authorisation reads the `isAdmin`/`isStaff` booleans while `Role` rows get a full CRUD API and are ignored. `Entity` is dead code (`NC-64`), and `Visit` is never written (`NC-62`).
- **No media handling** (`NC-61`), which is also what blocks the second half of the page builder (`NC-58`).

Things that need a human decision, not a patch:

- **`NC-5`** — the Heroku Postgres credential committed in `cms/.env.example` has been removed from the file, but it is still in the git history. It must be **rotated** on the provider.
- **`NC-51`** — `@nextcms/nextcms@0.1.19` depends on sibling versions that were never published to npm, so nobody can install it. Either publish the missing versions or switch to npm workspaces (`NC-38`).
- **Mail delivery** — password recovery is implemented but no provider is wired: implement `MailTransport` and call `setMailTransport`.
- **`NC-71`** — Vercel's Root Directory must be set to `cms` in the dashboard; git cannot express it.
- **`NC-76`** — there are two editing surfaces: the forms and page builder in `cms/`, the panel in `admin/` linking across. Which app owns authoring is a decision.

## Pointers

- Todos: `BACKLOG.md` (`NC-n` ids) · Releases: `CHANGELOG.md` · Docs: `docs/` (`Prisma.md`, `NPM.md`) · Schema: `cms/prisma/schema.prisma`
- CI: `.github/workflows/` — `ci.yml` (gate: typecheck/lint/test/build), `codeql.yml`, `docker-publish.yml` (tag `v*` → image on ghcr.io), `backlog-sync.yml`, `pages.yml`, `release.yml`
- **Do not put `prisma -v` (or anything that runs the schema engine) in the build** (`NC-74`): it can fail where `prisma generate` succeeds, turning a working build into a failing one. Proven, not theorised.
- **`cms/vercel.json` pins `npm ci --include=dev`** (`NC-75`): plain `npm ci` under `NODE_ENV=production` installs 144 packages instead of 900 and none of `tsc`, `prisma` or `next`, so the build dies immediately.
- **The `cms` build script must keep running `prisma generate`** (`NC-70`): the generated client lives in `node_modules/.prisma`, and any host that restores `node_modules` from a cache — Vercel does — skips the postinstall that would create it. Without it the build fails type-checking with `'@prisma/client' has no exported member 'Prisma'`. A local `.next` cache hides this, so test with `rm -rf .next node_modules/.prisma`.
- **Vercel needs Root Directory = `cms`** (`NC-71`), a dashboard-only setting: the repo root has no `next` and no scripts, so a project pointed at it cannot build.
- **`engines.node` must stay identical in all three manifests** — root, `cms/`, `admin/` (`NC-72`). Vercel reads it from the manifest at the project's Root Directory only; putting it just in `cms/` is invisible to a project pointed at the repo root, and the dashboard's stale value wins. `check-engines.mjs` gates this in CI.
- **Releases are automatic**: pushing a `v*` tag publishes a GitHub release whose body is that version's `CHANGELOG.md` section (`release.yml`). A tag with no changelog section **fails the workflow** — so writing the changelog entry is not optional, it is what makes the release publishable.
- **Backlog automation**: every push touching `BACKLOG.md` syncs the `NC-n` items to GitHub issues and the `## Mn` sections to milestones (`.github/scripts/backlog-sync.mjs`). The file is the source of truth and is never written back to — close an item by ticking it in the file, not by closing the issue.
- **Documentation site**: `docs/index.html` (static, no build step) deployed by `pages.yml`. It states the project status publicly, so keep it honest when behaviour changes.
- Env: `.env.example` (root, Prisma) and `cms/.env.example` — `cms` reads `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `ALLOW_PUBLIC_REGISTRATION`, `PASSWORD_RESET_TTL_MINUTES`, `LOG_LEVEL`, `ADMIN_URL`, `API_URI`, `BASE_URI`, `SITE_NAME`. **`admin` reads `CMS_ORIGIN`** (default `http://localhost:3000`), which is where its `/admin/api/*` rewrite points — it is resolved at build time, so CI sets it too.
- Dev container: `.devcontainer/` · Debug: `.vscode/launch.json`
