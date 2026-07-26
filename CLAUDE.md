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
  - `lib/helpers/auth.ts` — token signing/verification and the `requireAuth` / `requireAdmin` guards used by the API routes.
  - `lib/types/response/response.ts` — uniform envelope: `successResponse(data, message)` / `errorResponse(error)` with `DEFAULTResponse.OK|KO`.
  - `lib/utils/logger.ts` — levelled logger. Never log request or response objects.
  - `lib/reducers/` — Redux Toolkit (`auth`, `layout`, `dragAndDrop`) mounted in `store.ts`; the page builder (`components/pagebuilder/`, react-dnd) builds on it.
  - `lib/prisma.ts` — the `PrismaClient` singleton.
- **`admin/`** (`next-admin`) — panel on the Metronic theme (`src/_metronic`), `basePath: '/admin'`, port 4000. **No Prisma**: it talks to the `cms/` API through `lib/helpers/fetchWrapper.ts`. It is the least developed part (only `_app`, `index`, `_middleware`).
- **`packages/`** — published npm packages, CommonJS, independent of the two Next apps:
  - `core/nextcms` → `@nextcms/nextcms`: the `nextcms` CLI (commander) plus a Strapi-style bootstrap/loader on Koa.
  - `core/utils` → `@nextcms/utils`: env helper, errors, sanitize/visitors (including `remove-password`).
  - `generators/app` → `@nextcms/generate-new`, `generators/generators` → `@nextcms/generators` (plop).
  - `cli/create-nextcms-app`: the `npx create-nextcms-app` scaffolder.
- **Data** — `cms/prisma/schema.prisma`: `Page`, `Component` (tree via `parent` + `template` + `data`), `Entity`, `User`, `Role`, `Visit`. Provider is **postgresql** through `DATABASE_URL` (the sqlite variant is commented out in the schema).

## Known traps / technical rules

- **The root `Dockerfile` and `Dockerfile-slim` do not build the app** (`NC-27`): the root has neither `next` nor scripts. The real pipeline is `.github/workflows/docker-publish.yml` with context `./cms` and `cms/Dockerfile` → pushed to `ghcr.io`. `Dockerfile-slim` also copies `.next/standalone` and `.npmrc`, but `cms/next.config.js` does not set `output: 'standalone'` and `.npmrc` does not exist: fix it before using it, do not copy it elsewhere. `cms/Dockerfile` has been rewritten and is the good one.
- **`bootstrap` is pinned to `~5.1.3` on purpose** (`NC-52`): the Metronic theme in `styles/sass/_init.scss` uses the Bootstrap 5.1 import sequence, and since 5.3 `$theme-colors-rgb` lives in `_maps.scss` — unpinning breaks the build with `SassError: Undefined variable`.
- **`@popperjs/core` and the apexcharts pair are aligned** so npm can resolve the tree (`NC-50`): do not move them back.
- **Lockfiles must be regenerated from scratch**, not "refreshed": the `admin` one was lockfileVersion 2 and omitted the optional SWC binaries, and regenerating it with `node_modules` already populated inherits the omission. If `@next/swc-*` is missing, `rm -rf node_modules package-lock.json` and reinstall.
- **The `packages/@nextcms/*` packages are not installable** (`NC-51`): they depend on versions of their own siblings that were never published to npm. That is why `ci.yml` has no `packages` job.
- **Auth lives in the API handlers, not in middleware**: `_middleware.ts` runs on the edge runtime, where `jsonwebtoken` cannot verify a signature. Guard routes with `requireAuth`/`requireAdmin` from `lib/helpers/auth.ts`; the middleware only does a cheap cookie presence check for page redirects.
- **Passwords are hashed with `bcryptjs` and tokens signed with `jsonwebtoken` in the repo/auth layer**, never in a handler. `JWT_SECRET` is mandatory: the app fails fast at startup without it.
- **Never return a raw Prisma `User`**: use `publicUserSelect` / the `PublicUser` type so the password hash cannot leak (`NC-1`).
- **Never log a request or response object**: they carry headers and cookies, i.e. tokens. Use `lib/utils/logger.ts`.
- After every `schema.prisma` change run `npx prisma generate`, otherwise the `Prisma.*Input` types used by the repos will not match.
- The `@nextcms/*` packages declare `engines: node >=12.22.0 <=17.x.x`: on a modern Node some of them may refuse to install — that is not a bug in the Next apps.

## Roadmap

`BACKLOG.md` defines **sequential** milestones, each with its release: **M0** green build ✅ (`v0.5.0`) → **M1** security ✅ (`v0.6.0`) → **M2** correct APIs ✅ (`v0.7.0`) → **M3** working auth (`v0.8.0`) → **M4** content and page builder (`v0.9.0`) → **M5** admin (`v0.10.0`) → **M6** road to 1.0 (`v1.0.0`). Separately, **M0b** (`v0.5.2`) for the npm packages. Do not open items from a later milestone until the previous one is closed (all items ticked, CI green, changelog section, tag).

## Known state

The repo is WIP. The audit on commit `7ac0299` opened 52 items in `BACKLOG.md`; M0, M1 and M2 have closed 35 of them. The apps build, the API answers correctly and the auth chain is sound. What is still missing is **product**, not repair: user management flows (`NC-39`, `NC-40`), content management (`NC-41`), page builder persistence (`NC-42`) and the admin panel (`NC-43`, `NC-44`), plus the Next 13 migration (`NC-33`) and a test suite (`NC-31`).

Two things need a human decision, not a patch:

- **`NC-5`** — the Heroku Postgres credential committed in `cms/.env.example` has been removed from the file, but it is still in the git history. It must be **rotated** on the provider.
- **`NC-51`** — `@nextcms/nextcms@0.1.19` depends on sibling versions that were never published to npm, so nobody can install it. Either publish the missing versions or switch to npm workspaces.

## Pointers

- Todos: `BACKLOG.md` (`NC-n` ids) · Releases: `CHANGELOG.md` · Docs: `docs/` (`Prisma.md`, `NPM.md`) · Schema: `cms/prisma/schema.prisma`
- CI: `.github/workflows/` — `ci.yml` (gate: typecheck/lint/build), `codeql.yml`, `docker-publish.yml` (tag `v*` → image on ghcr.io)
- Env: `.env.example` (root, Prisma) and `cms/.env.example` — variables in use: `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `ALLOW_PUBLIC_REGISTRATION`, `LOG_LEVEL`, `ADMIN_URL`, `API_URI`, `BASE_URI`
- Dev container: `.devcontainer/` · Debug: `.vscode/launch.json`
