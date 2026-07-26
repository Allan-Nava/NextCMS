# AGENTS.md — NextCMS

**NextCMS**: a CMS on Next.js 12 + TypeScript + Prisma (WIP, MIT). Three independent parts: `cms/` (public app + API, port 3000), `admin/` (Metronic panel, port 4000, `basePath /admin`), `packages/` (the `@nextcms/*` npm packages, CommonJS).

This file defines the working rules for agents (Copilot, Claude, other AI tools) operating in this repository.

## Working rules (ALWAYS)

- **Every feature = one tag `vX.Y.Z`**: a section in `CHANGELOG.md` (Keep a Changelog) plus `git tag -a vX.Y.Z -m "Release X.Y.Z"`. `minor` for features, `patch` for fixes and docs. Pushing the tag publishes a GitHub release from that changelog section, and a missing section fails the workflow — so the entry is mandatory in practice, not just by convention.
- **Track everything**: every piece of work exists as an `NC-n` item in `BACKLOG.md` before you start, gets ticked when released, and the commit cites its id (`NC-12: fix login response envelope`).
- **Document it**: changes to architecture, commands, env vars, the Prisma schema or an API contract update `CLAUDE.md` and `AGENTS.md` in the same commit.
- **No workspaces**: run `npm ci` and the scripts inside `cms/`, `admin/` or the individual package. Never from the repo root (no scripts there).
- **Gate before closing**: `npm run lint`, `npm test` and `npm run build` green in the app you touched.
- **NEVER `git push`**: the user always does it, tags included. NEVER add `Co-Authored-By`.
- **No secrets** in code, `.env.example`, docs or logs.
- **Todos go to `BACKLOG.md`** (stable `NC-n` ids); no scattered `TODO:` comments. A push that touches it syncs the items to GitHub issues and milestones (`backlog-sync.yml`) — close an item by ticking it in the file, never by closing the issue by hand.
- **Language is English** for code, comments, docs and user-facing output.
- **Next 12 + React 17, `pages/` router**: no major bumps (Next 13+/App Router) without asking.

## Commands

- `cd cms && npm run dev` (3000) · `npm run build` · `npm start` · `npm run lint` · `npm test`
- `cd admin && npm run dev` (4000)
- Prisma (from `cms/`): `npx prisma validate` · `npx prisma generate` · `npx prisma migrate dev` · `npx prisma db seed` · `npx prisma studio`

## Where things live

- Dynamic rendering: `cms/components/DynamicComponents.tsx`, resolving components through the static allow-list in `cms/components/registry.ts`; pages resolved by slug in `cms/pages/[...index].tsx` and `cms/pages/index.tsx`.
- API: `cms/pages/api/<entity>/{index,[id]}.ts`, `switch (req.method)` with a `405` default, no inline DB logic.
- Auth: `cms/lib/helpers/auth.ts` — token signing/verification plus the `requireAuth` / `requireAdmin` guards. Password recovery in `password-reset.ts` (hashed, single-use, expiring tokens) and `mailer.ts` (transport seam, **no real provider configured**). Rate limiting in `lib/utils/rate-limit.ts`, per process.
- Auth endpoints: `login`, `logout`, `register`, `me`, `refresh`, `forgot-password`, `reset-password` under `cms/pages/api/auth/`. Screens: `/login`, `/profile`, `/forgot-password`, `/reset-password`.
- DB access: **only** `cms/lib/helpers/*-repo.ts` (`pagesRepo`, `userRepo`, `componentRepo`, `roleRepo`, `entityRepo`) through `cms/lib/prisma.ts`.
- API responses: `successResponse` / `errorResponse` from `cms/lib/types/response/response.ts`; status helpers in `cms/lib/utils/http.ts`.
- Input validation: `cms/lib/utils/validation.ts`. Logging: `cms/lib/utils/logger.ts`. Pagination: `cms/lib/utils/pagination.ts`.
- Visibility: `cms/lib/utils/visibility.ts` is the single predicate for "may an anonymous visitor see this" — renderer, API, sitemap and feed all call it. Never reimplement it.
- Archives: `cms/lib/helpers/archive.ts` behind `/posts`, `/category/<slug>` and `/tag/<slug>`.
- Page head: `cms/lib/utils/seo.ts` + `components/Seo.tsx`; `/sitemap.xml` and `/robots.txt` from `cms/lib/utils/sitemap.ts`; the Atom feed at `/feed.xml` from `cms/lib/utils/feed.ts` (posts only, 50 max, 503 without `BASE_URI`).
- UI state: Redux Toolkit in `cms/lib/reducers/`; react-dnd page builder in `cms/components/pagebuilder/`, screen at `cms/pages/page-builder.tsx`.
- Data model: `cms/prisma/schema.prisma` (`Page`, `Component` with `parent`+`position`, `Category`, `Tag`, `Entity`, `User`, `Role`, `Visit`, `PasswordResetToken`), postgresql provider. No `migrations/` directory — the project uses `prisma db push`, so push a schema change before the code that needs it can run.
- Tests: `cms/__tests__/*.test.ts` (jest + ts-jest, node environment).

## Admin panel

- Reads `CMS_ORIGIN` (build time) for the rewrite that proxies the cms API.
- It holds no token: `lib/crud/AdminAPI.ts` calls same-origin `/admin/api/*`, proxied to the cms by a rewrite, so the HttpOnly cookie does the work (`NC-54`). Cookies are host-scoped, not port-scoped — that is why it works across 3000/4000.
- Editing lives in `cms/`; the panel links across to it (`NC-76`).
- `src/_metronic` is unused and excluded from the typecheck.

## Security invariants — do not regress these

- **Never return a raw Prisma `User`**: use `publicUserSelect` / `PublicUser`, otherwise the bcrypt hash leaks (`NC-1`).
- **`JWT_SECRET` comes from the environment** and the app fails fast without it. Never reintroduce a default (`NC-2`).
- **Tokens carry `{sub, username, isAdmin, isStaff}` only** — never the user row (`NC-3`). A refresh token cannot be used as an access token.
- **Never log request/response objects, passwords or tokens** — they carry cookies. Use the logger (`NC-4`, `NC-7`).
- **Authorisation happens in the API handlers**, not in `_middleware.ts`: the edge runtime cannot verify a JWT signature. The middleware only does a cookie presence check for page redirects (`NC-6`).
- **The component registry is an allow-list**: never go back to `import(dbProvidedPath)` (`NC-34`). A layout is validated against it before it is saved.
- **Drafts must not leak**: a public listing filters on `publishedAt`; only an authenticated caller sees unpublished content (`NC-41`).
- **Stored JSON-LD must keep its closing tags escaped** before it is injected into a script tag (`NC-60`): an editor storing `</script>` would otherwise turn the rest into live markup.
- **New list endpoints must page** (`NC-78`): take a `Pagination`, return `{rows, total}`, answer with `pagedResponse`. `data` stays the array.
- **A content author is set from the session, never the payload**, and never exposed with its email (`NC-79`).
- **Drafts must stay out of the sitemap and get `noindex`** — all three paths use the same `isPubliclyVisible` predicate; do not reimplement it.
- **A post-login `?next=` must be validated** before redirecting — `safeRedirectTarget` / `safeReturnTo`, comparing parsed origins rather than prefixes (`NC-54`).
- **Reset tokens are stored hashed and are single-use**, and the production mail transport must never print one to the log (`NC-39`).
- **`forgot-password` answers the same way for a known and an unknown address**: a different answer is an account-enumeration oracle.

## Known traps

- `bootstrap` is pinned to `~5.1.3` on purpose (`NC-52`): the Metronic sass uses the 5.1 import sequence, and 5.3 breaks the build with `SassError`.
- `@popperjs/core` and the apexcharts pair are aligned so npm can resolve (`NC-50`): do not move them back.
- Lockfiles: always regenerate from scratch (`rm -rf node_modules package-lock.json`), otherwise you inherit the missing optional SWC binaries and the build fails with *Failed to load SWC binary*.
- The `cms` build script must keep `prisma generate` in it (`NC-70`): hosts that cache `node_modules` skip the postinstall, and the build then fails type-checking. Reproduce with `rm -rf .next node_modules/.prisma`.
- Vercel needs Root Directory = `cms` — dashboard-only, the repo root is not deployable (`NC-71`).
- `engines.node` must be identical in the root, `cms/` and `admin/` manifests (`NC-72`): Vercel reads only the one at the Root Directory. Gated by `check-engines.mjs` in CI.
- The root `Dockerfile` and `Dockerfile-slim` build nothing (the root has no `next`): the real image comes from `cms/Dockerfile` via `docker-publish.yml` (`NC-27`).
- Node is **24**, pinned in five places that must stay in sync (`NC-55`): `ci.yml` (both jobs), `cms/Dockerfile` (both stages), `.devcontainer/devcontainer.json` (`VARIANT`), and `engines.node` in `cms/package.json` and `admin/package.json`. Vercel reads `engines.node` and it beats the dashboard setting — change it in git, not in the Vercel project.
- `cms/Dockerfile` must install `openssl` (`NC-55`): the `-slim` images omit it, and without it Prisma resolves `linux-<arch>-openssl-undefined` and `prisma generate` dies with `Unknown binaryTarget`. Bookworm/OpenSSL 3 is fine for Prisma 3.15; alpine (musl) is a different target and is not.
- The `@nextcms/*` packages are not installable: they depend on versions never published to npm (`NC-51`). That is why CI has no `packages` job.
- The `cms/.env.example` credential has been removed from the file but is still in the git history: it must be **rotated** (`NC-5`).

## Roadmap

Sequential milestones in `BACKLOG.md`: **M0** green build OK (`v0.5.0`) -> **M1** security OK + **M2** correct APIs OK (`v0.6.0`) -> **M3** working auth OK (`v0.7.0`) -> **M4** content and page builder OK (`v0.8.0`) -> **M5** admin (`v0.9.0`) -> **M6** road to 1.0 (`v1.0.0`). Separately **M0b** (`v0.5.2`) for the npm packages. Do not open items from a later milestone until the previous one is closed.

## Pointers

- Todos: `BACKLOG.md` (`NC-n`) · Releases: `CHANGELOG.md` · Docs: `docs/` · CI: `.github/workflows/` (`ci.yml`, `codeql.yml`, `docker-publish.yml`) · Env: `cms/.env.example`
