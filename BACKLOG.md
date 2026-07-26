# BACKLOG — NextCMS

Single source of todos. Every item has a **stable `NC-n` id**: ids are never reused and never renumbered, even when an item moves milestone. Tick `[x]` when the work is done *and* released (tag + entry in [`CHANGELOG.md`](CHANGELOG.md)).

Initial state populated from the **audit of 2026-07-25** on commit `7ac0299`.

Severity: 🔴 critical · 🟠 high · 🟡 medium · ⚪ debt.

---

## Roadmap

Milestones are **sequential**: each only makes sense once the previous one is closed. One rule — you do not build features on a project that does not compile, and you do not ship an auth layer that leaks password hashes.

| # | Milestone | Goal | Release | Items |
|---|---|---|---|---|
| **M0** | Green build | `prisma generate`, `tsc`, `next build` pass for cms and admin, and CI checks it | `v0.5.0` ✅ | NC-24…26, 29, 30, 45…47, 49, 50, 52 |
| **M0b** | npm packages | `@nextcms/*` installable and testable | `v0.5.2` | NC-48, NC-51 |
| **M1** | Security | No secrets around, no password hashes in responses, guarded routes | `v0.6.0` ✅ | NC-1…10 |
| **M2** | Correct APIs | Every endpoint answers, with the right status and the right data | `v0.6.0` ✅ | NC-11…23 |
| **M3** | Working auth | Full login/logout/register/reset flows, profile screen | `v0.7.0` ✅ | NC-39, 40, 53 |
| **M4** | Content and page builder | Pages and components creatable, persisted and rendered from the DB | `v0.8.0` | NC-41, NC-42 |
| **M5** | Admin | The panel stops being a placeholder | `v0.9.0` | NC-36, 43, 44, 54 |
| **M6** | Road to 1.0 | Debt, tests, Next migration | `v1.0.0` | NC-27, 31…33, 37, 38 |

Release numbering note: M1 and M2 shipped together in `v0.6.0`, so everything after moved up one minor from the original plan.

**Definition of done** for a milestone: every item ticked, CI green, a section in `CHANGELOG.md`, tag created.

---

## M0 · Green build (apps) → `v0.5.0` ✅

**Closed.** `cms` and `admin` install, typecheck, lint and build; CI verifies the sequence.

- [x] 🔴 **NC-24** — `cms/prisma/schema.prisma`: `Visit` declared `Page Page? @relation(fields: [id], references: [id])` with no opposite field on `Page` → `prisma generate` failed with P1012, and it reused the primary key as a foreign key. *(v0.5.0: relation redesigned with `pageId` + `Page.visits Visit[]` and its own index; `prisma validate` passes.)*
- [x] 🟠 **NC-25** — Mandatory fields missing from create calls. *(v0.5.0: `type` added to `pagesRepo.create` (default `"page"`) and to `prisma/seed.ts`; `template` and `data` added to `componentRepo.create`.)*
- [x] 🟠 **NC-26** — `cms/` had **no lockfile at all**. *(v0.5.0: `cms/package-lock.json` generated and `admin/package-lock.json` regenerated — the committed one was lockfileVersion 2 and omitted the optional SWC binaries, so `npm ci` produced a broken build. `ci.yml` moved to `npm ci` with npm cache.)*
- [x] 🟠 **NC-29** — No build gate in CI. *(v0.5.0: `ci.yml` added with typecheck, lint and build for cms and admin, plus prisma validate/generate.)*
- [x] 🟡 **NC-30** — `cypress.yml` ran on every push with no Cypress tests in the repo. *(v0.5.0: workflow removed; E2E returns with NC-31.)*
- [x] 🟠 **NC-45** — `codeql.yml` used `codeql-action@v2`, retired by GitHub in January 2025, so the workflow always failed. *(v0.5.0: moved to v3 with `javascript-typescript` and the `security-and-quality` queries.)*
- [x] 🟠 **NC-46** — `docker-publish.yml` used `::set-output`, a command GitHub has disabled, plus v1/v2/v3 actions: it no longer published. *(v0.5.0: rewritten with `docker/metadata-action@v5` and current actions.)*
- [x] 🟡 **NC-47** — `cms/` and `admin/` had no ESLint config (only the root one, which the apps cannot resolve): `next lint` in CI would have started its interactive setup. *(v0.5.0: `.eslintrc.json` per app.)*
- [x] 🟡 **NC-49** — `cms/Dockerfile` could not work: non-existent base tag (`node:17.4-stretch`), `apt -y install curl` without `apt-get update`, no `prisma generate` (the `@prisma/client` postinstall ran before the schema was in the image) and a production stage that copied dependencies without the generated client. *(v0.5.0: rewritten on `node:18-bullseye-slim` with `npm ci`, an explicit `prisma generate` and `node_modules/.prisma` copied into the runtime stage.)*
- [x] 🔴 **NC-50** — `npm install` **failed with ERESOLVE** in both apps: `@popperjs/core` pinned `~2.10.1` against `bootstrap@5.3.x` requiring `^2.11.8`, and `apexcharts@^3.27.1` against `react-apexcharts@1.9.x` requiring `>=4`. The project was not installable with npm 7+ without `--legacy-peer-deps`. *(v0.5.0: `@popperjs/core` to `^2.11.8`, apexcharts pair aligned on `^3.41.0` / `~1.5.0`.)*
- [x] 🟠 **NC-52** — `bootstrap: "^5.1.3"` floated to 5.3.x, which moved `$theme-colors-rgb` into `_maps.scss`: the Metronic sass (`styles/sass/_init.scss`, 5.1 import sequence) stopped compiling and `next build` died with `SassError: Undefined variable`. *(v0.5.0: pinned to `~5.1.3`, the version the theme is written for. Upgrading the design system is separate work.)*

## M0b · npm packages → `v0.5.2`

Independent of the apps: the `@nextcms/*` packages are blocked by a single cause.

- [ ] 🔴 **NC-51** — `@nextcms/nextcms` depends on sibling versions **never published to npm**: it asks for `@nextcms/generators@0.1.4` (only up to 0.1.2 published) and `@nextcms/utils@0.1.10` (only 0.1.0). `npm install` fails with `notarget`, so the published `@nextcms/nextcms@0.1.19` **cannot be installed by anyone** and its tests cannot run. Options: publish the missing versions, or resolve the siblings locally with npm workspaces (see NC-38). **Needs a human decision** — publishing is not something an agent should do unprompted.
- [ ] 🟡 **NC-48** — `packages/core/nextcms` declared `"test:unit": "jest --verbose"` without jest in its devDependencies. *(v0.5.0: jest `^29.7.0` and a `jest` config added to package.json — not verifiable while NC-51 blocks the install.)*

## M1 · Security → `v0.6.0` ✅

**Closed.** Regression tests for the token invariants live in `cms/__tests__/auth.test.ts`.

- [x] 🔴 **NC-1** — `GET /api/user` and `GET /api/user/[id]` returned the full user row, **bcrypt hash included** (`userRepo` used `findMany`/`findUnique` with no `select`), and `POST /api/auth/register` answered 201 with the whole object. *(v0.6.0: `publicUserSelect` / `PublicUser` introduced in `lib/types/user.ts` and used by every read; `verifyCredentials` is the only path that touches the password column.)*
- [x] 🔴 **NC-2** — JWTs were signed with the **hardcoded** secret `'shhhhh'`. *(v0.6.0: `JWT_SECRET` read from the environment through `requireEnv`, which throws when it is missing — lazily, so `next build` does not need it.)*
- [x] 🔴 **NC-3** — The JWT payload was **the entire user row, password hash included**, with no `expiresIn`. *(v0.6.0: claims reduced to `{sub, username, isAdmin, isStaff}` with `JWT_ACCESS_TTL` (15m default); separate refresh token marked `type: 'refresh'` so it cannot be replayed as an access token.)*
- [x] 🔴 **NC-4** — `cms/next.config.js` ran `console.log("process ", process.env)` and printed `DATABASE_URL`: every environment variable, credentials included, landed in build and runtime logs. *(v0.6.0: removed from both apps, with a comment explaining why it must not come back.)*
- [x] 🔴 **NC-5** — A live Heroku Postgres credential was committed in `cms/.env.example`. *(v0.6.0: file replaced with documented placeholders. ⚠️ **The credential is still in the git history and must be rotated on the provider** — that part is not something a code change can fix.)*
- [x] 🔴 **NC-6** — No route was protected: `_middleware.ts` only called `NextResponse.next()` and no handler checked a session, so the `user`, `page`, `components` and `role` write endpoints were public. *(v0.6.0: `requireAuth` / `requireAdmin` guards applied per route; the middleware now redirects unauthenticated visitors away from `/page-builder` with a cookie presence check, and the comment states plainly that this is not the authorisation decision.)*
- [x] 🟠 **NC-7** — `console.log("req ", req, "res ", res)` in several handlers logged headers and cookies, i.e. tokens, in clear text. *(v0.6.0: all removed; `lib/utils/logger.ts` logs identifiers only.)*
- [x] 🟠 **NC-8** — `POST /api/user` and `POST /api/auth/register` were open, with no validation or rate limiting. *(v0.6.0: `lib/utils/validation.ts` added; user creation is admin-only; self-registration is off unless `ALLOW_PUBLIC_REGISTRATION=true` and can never mint an admin. Rate limiting is still open — see NC-53.)*
- [x] 🟠 **NC-9** — `cms/prisma/dev.db` (SQLite, 45 KB) was tracked while the provider is `postgresql`. *(v0.6.0: untracked and `*.db` added to `.gitignore`.)*
- [x] 🟠 **NC-10** — Dependencies on versions with known advisories. *(v0.6.0: `jsonwebtoken` 8.5.1 → `^9.0.2`, `axios` 0.21.1 → `^1.12.2`, `react-scripts@4.0.3` removed from both apps as an unused CRA leftover — it alone pulled in ~1700 transitive packages. Next stays on 12.1.1: moving off it is NC-33.)*

## M2 · Correct APIs → `v0.6.0` ✅

**Closed.** Shipped together with M1: both milestones rewrite the same handlers, and splitting them would have meant writing every route twice.

- [x] 🔴 **NC-11** — **Login broken end to end**: `userRepo.login` returned a string (the token), the handler wrapped it as `successResponse(user, ...)` → `{data: "<jwt>"}`, while `pages/login.tsx` expected `data.data.access_token` and `refresh_token`. *(v0.6.0: contract is now `data: { access_token, refresh_token, user }`, and both sides agree on it.)*
- [x] 🟠 **NC-12** — `lib/crud/AuthCRUD.ts` sent a `FormData` body while forcing `Content-Type: application/x-www-form-urlencoded`, so Next's body parser never populated `req.body`. *(v0.6.0: sends JSON. The pointless one-second `setTimeout` around the login call is gone too.)*
- [x] 🟠 **NC-13** — Bad credentials made `userRepo.login` throw with no try/catch in the handler → generic 500, and the `errorResponse` branch was dead code. *(v0.6.0: `verifyCredentials` returns null and the route answers 401.)*
- [x] 🟠 **NC-14** — Handlers that **never answered** (request hung until timeout): `POST /api/auth/logout`, the `handleDELETE` stubs of `page/[id]`, `user/[id]`, `role/[id]`, and the catch branch of `api/role/index.ts`. *(v0.6.0: every branch answers; deletes are implemented as soft deletes.)*
- [x] 🟠 **NC-15** — Dynamic routes read `req.body.id` instead of `req.query.id` on GET/DELETE: `parseInt(undefined)` → `NaN` → Prisma error. *(v0.6.0: `parseId` in `lib/utils/http.ts`, used by every `[id]` route and covered by tests.)*
- [x] 🟡 **NC-16** — Unsupported methods: `[id]` routes threw `new Error(...)` → 500, while the `index` routes answered 405. *(v0.6.0: `methodNotAllowed` everywhere, with an `Allow` header.)*
- [x] 🟠 **NC-17** — `POST /api/page` and `POST /api/components` had their create call commented out and answered `200 {}`, faking success. *(v0.6.0: both create, validate their payload and answer 201.)*
- [x] 🔴 **NC-18** — `pages/[...index].tsx` returned `props: { basePages }` while the component destructured `{ data }`, so the page always rendered empty; it also used `context.req.url` (path plus query string) as the slug. *(v0.6.0: props aligned, slug derived from the route segments by `slugFromSegments`, unknown slug → 404.)*
- [x] 🟠 **NC-19** — `pages/index.tsx` called `pagesRepo.getBySlug("/")` and then **ignored** the result, rendering a hardcoded component list. *(v0.6.0: renders the `/` page from the database through the shared `loadPage`.)*
- [x] 🟡 **NC-20** — `api/auth/register.ts` passed `username` as the email too, and `email` is `@unique`. *(v0.6.0: email is a validated, separate field; a collision is a 409, not a 500.)*
- [x] 🟡 **NC-21** — `componentRepo.create` stored `property: bodyComponent.toString()`, i.e. the string `"[object Object]"`. *(v0.5.0: uses `JSON.stringify`, like `update` already did.)*
- [x] 🟡 **NC-22** — Incomplete repo layer: `pagesRepo.update` and `userRepo.update` returned nothing (and the user one did not update), `roleRepo` had no `update`/`delete`. *(v0.6.0: every repo exposes create/read/update/delete, returns the affected row and takes a typed patch object.)*
- [x] 🟡 **NC-23** — `api/role/index.ts` bypassed the repo layer and used `prisma` directly. *(v0.6.0: goes through `roleRepo`.)*

## M3 · Working auth → `v0.7.0` ✅

**Closed.** The session lifecycle is complete on the `cms` side: sign in, stay signed in, recover a lost password, edit your own account.

- [x] **NC-39** — Complete auth and user management. *(v0.7.0: `POST /api/auth/refresh` exchanges a refresh token for a fresh access token, re-reading the user so a deleted or demoted account cannot keep renewing; `GET /api/auth/me` returns the session's user from the database rather than from stale token claims; `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` implement recovery, backed by the new `PasswordResetToken` model. Only the SHA-256 hash of a reset token is stored, tokens are single-use and expire after `PASSWORD_RESET_TTL_MINUTES` (30 by default), and issuing a new one invalidates the outstanding ones. **Propagating the session to the admin app moved to NC-54 (M5)**: admin has no login UI yet, and a cross-origin cookie between ports 3000 and 4000 is a deployment-topology decision, not a code fix.)*
- [x] **NC-40** — User profile screens. *(v0.7.0: `/profile` reads `GET /api/auth/me` and updates through `PATCH /api/user/:id`, with an empty password field meaning "leave it alone"; `/forgot-password` and `/reset-password` complete the recovery flow. All three sit behind the middleware where they need a session. Creating users stays admin-only through `POST /api/user` — the admin UI for it is NC-43.)*
- [x] 🟠 **NC-53** — No rate limiting on `POST /api/auth/login` and `POST /api/auth/register`: credential stuffing was only slowed down by bcrypt. *(v0.7.0: fixed-window limiter in `lib/utils/rate-limit.ts` — 10 login attempts per IP per 5 minutes, 5 registrations and 5 reset requests per IP per hour, `429` with a `Retry-After` header. Bucketed by IP, not by username, so nobody can lock a known account out on purpose. **Counters are per process**: behind several instances the effective limit is per instance — a shared store is the next step if the app is scaled out.)*

## M4 · Content and page builder → `v0.8.0`

- [ ] **NC-41** — Content management: posts, pages, categories, tags.
- [ ] **NC-42** — Page builder: blocks, images, layout persistence. The drag-and-drop UI exists but nothing is saved; `Component.parent` is the attachment point the renderer already reads.
- [x] 🟡 **NC-34** — `DynamicComponents` did `import(\`${item.path}\`)` with the path coming from the database: webpack had to bundle a whole require-context and the module loaded was decided by data. *(v0.6.0: static allow-list in `components/registry.ts`; the API refuses an unregistered path, the renderer falls back to `NoComponent`.)*
- [x] 🟡 **NC-35** — Duplicate pages: `cms/pages/pagebuilder.tsx` and `cms/pages/page-builder.tsx`. *(v0.6.0: the older `pagebuilder.tsx` removed; `page-builder.tsx` is the guarded path.)*

## M5 · Admin → `v0.9.0`

- [ ] ⚪ **NC-36** — `admin/package.json` duplicates ~70 devDependencies of `cms/` (Metronic and CRA leftovers) for three pages. Trim it. `react-scripts` is already gone (NC-10).
- [ ] **NC-43** — Admin UI/UX: every entity wired up, including the admin-only user creation screen.
- [ ] **NC-44** — Admin API: full CRUD per entity, consuming the `cms/` API with a bearer token.
- [ ] 🟠 **NC-54** — Session shared between `cms` (port 3000) and `admin` (port 4000). The access-token cookie is HttpOnly and scoped to its origin, so it does not travel between the two dev servers; in production the intended topology is a single origin with admin under `/admin`. Needs a decision: same-origin multi-zone, or admin holding a bearer token obtained through its own login screen. Carved out of NC-39, which shipped the rest of the auth work in v0.7.0.

## M6 · Road to 1.0 → `v1.0.0`

- [ ] 🟡 **NC-27** — The root `Dockerfile` and `Dockerfile-slim` build nothing (the root has no `next` and no scripts). `Dockerfile-slim` also copies `.next/standalone` (no `output: 'standalone'` in `next.config.js`) and an `.npmrc` that does not exist. Either fix or delete them; `cms/Dockerfile` is the real one.
- [ ] 🟡 **NC-31** — Test coverage. *(v0.6.0: jest + ts-jest set up in `cms/` with 37 tests over auth, validation and request parsing, wired into CI. v0.7.0: 52 tests, adding the rate limiter and the reset-token/mailer invariants. Still missing: repo-layer tests against a test database, handler-level tests, and the E2E suite removed with NC-30.)*
- [ ] ⚪ **NC-32** — 64 `console.*` calls in `cms/`. *(v0.6.0: `lib/utils/logger.ts` added and used by the API and repo layers; the remaining calls live in the page-builder components.)*
- [ ] 🟡 **NC-33** — Migration to Next 13+/App Router (currently Next 12.1.1, React 17, `pages/`, legacy `_middleware.ts`). A migration, not a bump — and the prerequisite for dropping the Next 12.x advisories.
- [ ] ⚪ **NC-37** — Duplicate lockfiles and orphan files. Root: `package-lock.json` + `yarn.lock` for a single dependency, an `.eslintrc.json` no app can resolve, and `haikus.json` (an Octocat fixture) out of context. `admin/`: `package-lock.json` and `yarn.lock` coexist, and something in the environment rewrites the latter after an `npm ci` — with two disagreeing lockfiles the install is not deterministic. npm is the declared package manager: remove the `yarn.lock` files.
- [ ] ⚪ **NC-38** — Consider npm workspaces to avoid installing folder by folder (and to unblock NC-51).
- [x] 🟡 **NC-28** — `BASE_URI` was hardcoded to a Vercel URL in `cms/lib/utils/constants.ts` with the env read commented out. *(v0.6.0: both `BASE_URI` and `API_URI` come from the environment.)*
