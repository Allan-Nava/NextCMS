# CLAUDE.md — NextCMS

**NextCMS** (`github.com/Allan-Nava/NextCMS`, MIT): a headless-ish CMS built on **Next.js 12 + TypeScript + Prisma**, still **WIP**. This is not a workspace monorepo — it is one repo holding three independent things: the public app `cms/`, the `admin/` panel (Next multi-zone), and the `@nextcms/*` npm packages under `packages/` (a CommonJS CLI/framework, Strapi-inspired). Core idea: pages are **data** (`Page` + `Component` tables) and rendering is dynamic through `next/dynamic`, not a hardcoded component tree.

## Working rules (ALWAYS)

- **Every feature = one tagged release `vX.Y.Z`**: a new section in `CHANGELOG.md` (Keep a Changelog) plus `git tag -a vX.Y.Z -m "Release X.Y.Z"`. Bump `minor` for features and behaviour changes, `patch` for fixes and docs. Do it without being asked.
- **Track everything, always**: no untracked work. Anything you do exists as an `NC-n` item in `BACKLOG.md` **before** you start (create it if missing), gets ticked `[x]` once released, and lands in `CHANGELOG.md` with the tag. Every closed item cites its id in the commit (`NC-12: fix login response envelope`).
- **Document what you change**: if a change touches architecture, commands, env vars, the Prisma schema or an API contract, update `CLAUDE.md` and `AGENTS.md` in the same commit. Stale docs mean the work is not finished.
- **Every folder is its own project**: `cms/`, `admin/` and each package under `packages/` have their own `package.json` and lockfile. Run `npm install` and the scripts **inside** the folder, never from the repo root (the root `package.json` has a single dependency and no scripts).
- **Gate before closing**: `npm run lint` and `npm run build` green in the app you touched. There is no test suite for `cms/`/`admin/` yet — if you add non-trivial logic under `lib/helpers/*` or `lib/utils/*`, add the test with it.
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

# admin panel (port 4000, served under /admin)
cd admin && npm ci && npm run dev

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
  - `pages/api/<entity>/{index,[id]}.ts` — one handler per entity (`page`, `components`, `user`, `role`, `auth`): `switch (req.method)` with a `405` default, no inline DB logic.
  - `lib/helpers/*-repo.ts` — **the only place that talks to Prisma** (`pagesRepo`, `userRepo`, `componentRepo`, `roleRepo`, `entityRepo`). API routes delegate here.
  - `lib/helpers/auth.ts` — token signing/verification, the access-token cookie, and the `requireAuth` / `requireAdmin` guards used by the API routes.
  - `lib/helpers/password-reset.ts` — reset tokens: only their SHA-256 hash is stored, they are single-use and they expire. `lib/helpers/mailer.ts` is the transport seam — **no real mail provider is configured**.
  - `lib/utils/rate-limit.ts` — fixed-window limiter on the auth endpoints. Counters are per process, so behind several instances the limit is per instance.
  - `lib/helpers/taxonomy-repo.ts` — categories and tags; `tagRepo.ensureMany` creates tags named in a payload.
  - Editor screens: `/content` (list), `/content/new`, `/content/:id`, `/page-builder?page=<id>`, `/profile`. All behind the session middleware.
  - `lib/types/response/response.ts` — uniform envelope: `successResponse(data, message)` / `errorResponse(error)` with `DEFAULTResponse.OK|KO`.
  - `lib/utils/logger.ts` — levelled logger. Never log request or response objects.
  - `lib/utils/seo.ts` + `components/Seo.tsx` — the page head: title/description fallbacks, canonical, Open Graph, validated JSON-LD. `lib/utils/sitemap.ts` backs `/sitemap.xml` and `/robots.txt`.
  - `lib/reducers/` — Redux Toolkit (`auth`, `layout`, `dragAndDrop`) mounted in `store.ts`; the page builder (`components/pagebuilder/`, react-dnd) builds on it.
  - `lib/prisma.ts` — the `PrismaClient` singleton.
- **`admin/`** (`next-admin`) — the panel, `basePath: '/admin'`, port 4000. **No Prisma and no token**: every call goes through `lib/crud/AdminAPI.ts` to a same-origin `/admin/api/*` path that `next.config.js` proxies to the cms, so the HttpOnly cookie travels and there is no CORS (`NC-54`). Screens: dashboard, content overview (read-only, links into the cms editors), users, roles, taxonomies. `src/_metronic` is a vendored theme that is **not** in use — excluded from the typecheck, and adopting it means restoring the packages it imports.
- **`packages/`** — published npm packages, CommonJS, independent of the two Next apps:
  - `core/nextcms` → `@nextcms/nextcms`: the `nextcms` CLI (commander) plus a Strapi-style bootstrap/loader on Koa.
  - `core/utils` → `@nextcms/utils`: env helper, errors, sanitize/visitors (including `remove-password`).
  - `generators/app` → `@nextcms/generate-new`, `generators/generators` → `@nextcms/generators` (plop).
  - `cli/create-nextcms-app`: the `npx create-nextcms-app` scaffolder.
- **Data** — `cms/prisma/schema.prisma`: `Page` (content; `type` tells pages and posts apart, `publishedAt` marks drafts), `Component` (one layout block: `parent` = page id, `position` = order), `Category`, `Tag`, `Entity`, `User`, `Role`, `Visit`, `PasswordResetToken`. Provider is **postgresql** through `DATABASE_URL` (the sqlite variant is commented out in the schema). There is no `migrations/` directory: the project has always used `prisma db push`, so a schema change needs to be pushed to the database before the code that depends on it can run.

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
- **`BASE_URI` is now load-bearing**: it builds canonical URLs, the sitemap and password reset links. A wrong value is visible to search engines, not just internally.
- **Never log a request or response object**: they carry headers and cookies, i.e. tokens. Use `lib/utils/logger.ts`.
- After every `schema.prisma` change run `npx prisma generate`, otherwise the `Prisma.*Input` types used by the repos will not match.
- **The Node version is pinned in five places and they must agree** (`NC-55`): `.github/workflows/ci.yml` (both jobs), `cms/Dockerfile` (build and runtime stages), `.devcontainer/devcontainer.json` (`VARIANT`) and `engines.node` in `cms/package.json` and `admin/package.json`. The current version is **24**. Vercel reads `engines.node` and it **overrides the dashboard setting**, so change it here rather than in the Vercel project — a version that only exists in the dashboard is invisible to everyone. Note there is no Node 24 devcontainer image from Microsoft (that family stops at 22), which is why `.devcontainer/` builds on plain `node:24-bookworm-slim` and installs `sudo`/`git` itself.
- **Prisma needs the `openssl` binary in the image** (`NC-55`, `NC-74`): the `-slim` Node images do not ship it, and Prisma shells out to it to pick a query engine. Without it the platform resolves to `linux-<arch>-openssl-undefined` and `prisma generate` fails with `Unknown binaryTarget`. `cms/Dockerfile` installs it in both stages. Contrary to what the old comment in that file claimed, Prisma is fine on OpenSSL 3 — it publishes a `debian-openssl-3.0.x` engine — so bookworm is not the problem. Since `NC-74` (Prisma 5) a failed detection is a warning rather than a fatal error, but the engine still needs a matching `libssl` to load, so the package is still required. Alpine would be: musl is a different target (`linux-musl`) and needs checking separately.
- The `@nextcms/*` packages declare `engines: node >=12.22.0 <=17.x.x`: they will refuse to install on the Node 24 the apps now use — that is not a bug in the Next apps, it is `NC-51`/`NC-48` territory.

## Roadmap

`BACKLOG.md` defines **sequential** milestones, each with its release: **M0** green build ✅ (`v0.5.0`) → **M1** security ✅ + **M2** correct APIs ✅ (`v0.6.0`) → **M3** working auth ✅ (`v0.7.0`) → **M4** content and page builder ✅ (`v0.8.0`) → **M5** admin (`v0.9.0`) → **M6** road to 1.0 (`v1.0.0`). Separately, **M0b** (`v0.5.2`) for the npm packages. Do not open items from a later milestone until the previous one is closed (all items ticked, CI green, changelog section, tag).

## Known state

The repo is WIP. The audit on commit `7ac0299` opened 54 items in `BACKLOG.md`; M0 through M3 have closed 38 of them. The apps build, the API answers correctly and the whole session lifecycle works: sign in, refresh, recover a password, edit your own account.

What remains is mostly **product**, not repair: content management (`NC-41`), page builder persistence (`NC-42`) and the admin panel (`NC-43`, `NC-44`, `NC-54`), plus the Next 13 migration (`NC-33`) and deeper test coverage (`NC-31`).

Things that need a human decision, not a patch:

- **`NC-5`** — the Heroku Postgres credential committed in `cms/.env.example` has been removed from the file, but it is still in the git history. It must be **rotated** on the provider.
- **`NC-51`** — `@nextcms/nextcms@0.1.19` depends on sibling versions that were never published to npm, so nobody can install it. Either publish the missing versions or switch to npm workspaces.
- **Mail delivery** — password recovery is implemented but no provider is wired: implement `MailTransport` and call `setMailTransport`.
- **`NC-54`** — whether admin shares an origin with cms (multi-zone under `/admin`) or holds its own bearer token.

## Pointers

- Todos: `BACKLOG.md` (`NC-n` ids) · Releases: `CHANGELOG.md` · Docs: `docs/` (`Prisma.md`, `NPM.md`) · Schema: `cms/prisma/schema.prisma`
- CI: `.github/workflows/` — `ci.yml` (gate: typecheck/lint/test/build), `codeql.yml`, `docker-publish.yml` (tag `v*` → image on ghcr.io), `backlog-sync.yml`
- **Do not put `prisma -v` (or anything that runs the schema engine) in the build** (`NC-74`): it can fail where `prisma generate` succeeds, turning a working build into a failing one. Proven, not theorised.
- **`cms/vercel.json` pins `npm ci --include=dev`** (`NC-75`): plain `npm ci` under `NODE_ENV=production` installs 144 packages instead of 900 and none of `tsc`, `prisma` or `next`, so the build dies immediately.
- **The `cms` build script must keep running `prisma generate`** (`NC-70`): the generated client lives in `node_modules/.prisma`, and any host that restores `node_modules` from a cache — Vercel does — skips the postinstall that would create it. Without it the build fails type-checking with `'@prisma/client' has no exported member 'Prisma'`. A local `.next` cache hides this, so test with `rm -rf .next node_modules/.prisma`.
- **Vercel needs Root Directory = `cms`** (`NC-71`), a dashboard-only setting: the repo root has no `next` and no scripts, so a project pointed at it cannot build.
- **`engines.node` must stay identical in all three manifests** — root, `cms/`, `admin/` (`NC-72`). Vercel reads it from the manifest at the project's Root Directory only; putting it just in `cms/` is invisible to a project pointed at the repo root, and the dashboard's stale value wins. `check-engines.mjs` gates this in CI.
- **Backlog automation**: every push touching `BACKLOG.md` syncs the `NC-n` items to GitHub issues and the `## Mn` sections to milestones (`.github/scripts/backlog-sync.mjs`). The file is the source of truth and is never written back to — close an item by ticking it in the file, not by closing the issue.
- **Documentation site**: `docs/index.html` (static, no build step) deployed by `pages.yml`. It states the project status publicly, so keep it honest when behaviour changes.
- Env: `.env.example` (root, Prisma) and `cms/.env.example` — variables in use: `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `ALLOW_PUBLIC_REGISTRATION`, `PASSWORD_RESET_TTL_MINUTES`, `LOG_LEVEL`, `ADMIN_URL`, `API_URI`, `BASE_URI`, `SITE_NAME`
- Dev container: `.devcontainer/` · Debug: `.vscode/launch.json`
