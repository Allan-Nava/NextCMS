# AGENTS.md — NextCMS

**NextCMS**: a CMS on Next.js 12 + TypeScript + Prisma (WIP, MIT). Three independent parts: `cms/` (public app + API, port 3000), `admin/` (Metronic panel, port 4000, `basePath /admin`), `packages/` (the `@nextcms/*` npm packages, CommonJS).

This file defines the working rules for agents (Copilot, Claude, other AI tools) operating in this repository.

## Working rules (ALWAYS)

- **Every feature = one tag `vX.Y.Z`**: a section in `CHANGELOG.md` (Keep a Changelog) plus `git tag -a vX.Y.Z -m "Release X.Y.Z"`. `minor` for features, `patch` for fixes and docs.
- **Track everything**: every piece of work exists as an `NC-n` item in `BACKLOG.md` before you start, gets ticked when released, and the commit cites its id (`NC-12: fix login response envelope`).
- **Document it**: changes to architecture, commands, env vars, the Prisma schema or an API contract update `CLAUDE.md` and `AGENTS.md` in the same commit.
- **No workspaces**: run `npm ci` and the scripts inside `cms/`, `admin/` or the individual package. Never from the repo root (no scripts there).
- **Gate before closing**: `npm run lint`, `npm test` and `npm run build` green in the app you touched.
- **NEVER `git push`**: the user always does it, tags included. NEVER add `Co-Authored-By`.
- **No secrets** in code, `.env.example`, docs or logs.
- **Todos go to `BACKLOG.md`** (stable `NC-n` ids); no scattered `TODO:` comments.
- **Language is English** for code, comments, docs and user-facing output.
- **Next 12 + React 17, `pages/` router**: no major bumps (Next 13+/App Router) without asking.

## Commands

- `cd cms && npm run dev` (3000) · `npm run build` · `npm start` · `npm run lint` · `npm test`
- `cd admin && npm run dev` (4000)
- Prisma (from `cms/`): `npx prisma validate` · `npx prisma generate` · `npx prisma migrate dev` · `npx prisma db seed` · `npx prisma studio`

## Where things live

- Dynamic rendering: `cms/components/DynamicComponents.tsx`, resolving components through the static allow-list in `cms/components/registry.ts`; pages resolved by slug in `cms/pages/[...index].tsx` and `cms/pages/index.tsx`.
- API: `cms/pages/api/<entity>/{index,[id]}.ts`, `switch (req.method)` with a `405` default, no inline DB logic.
- Auth: `cms/lib/helpers/auth.ts` — token signing/verification plus the `requireAuth` / `requireAdmin` guards.
- DB access: **only** `cms/lib/helpers/*-repo.ts` (`pagesRepo`, `userRepo`, `componentRepo`, `roleRepo`, `entityRepo`) through `cms/lib/prisma.ts`.
- API responses: `successResponse` / `errorResponse` from `cms/lib/types/response/response.ts`; status helpers in `cms/lib/utils/http.ts`.
- Input validation: `cms/lib/utils/validation.ts`. Logging: `cms/lib/utils/logger.ts`.
- UI state: Redux Toolkit in `cms/lib/reducers/`; react-dnd page builder in `cms/components/pagebuilder/`, screen at `cms/pages/page-builder.tsx`.
- Data model: `cms/prisma/schema.prisma` (`Page`, `Component`, `Entity`, `User`, `Role`, `Visit`), postgresql provider.
- Tests: `cms/__tests__/*.test.ts` (jest + ts-jest, node environment).

## Security invariants — do not regress these

- **Never return a raw Prisma `User`**: use `publicUserSelect` / `PublicUser`, otherwise the bcrypt hash leaks (`NC-1`).
- **`JWT_SECRET` comes from the environment** and the app fails fast without it. Never reintroduce a default (`NC-2`).
- **Tokens carry `{sub, username, isAdmin, isStaff}` only** — never the user row (`NC-3`). A refresh token cannot be used as an access token.
- **Never log request/response objects, passwords or tokens** — they carry cookies. Use the logger (`NC-4`, `NC-7`).
- **Authorisation happens in the API handlers**, not in `_middleware.ts`: the edge runtime cannot verify a JWT signature. The middleware only does a cookie presence check for page redirects (`NC-6`).
- **The component registry is an allow-list**: never go back to `import(dbProvidedPath)` (`NC-34`).

## Known traps

- `bootstrap` is pinned to `~5.1.3` on purpose (`NC-52`): the Metronic sass uses the 5.1 import sequence, and 5.3 breaks the build with `SassError`.
- `@popperjs/core` and the apexcharts pair are aligned so npm can resolve (`NC-50`): do not move them back.
- Lockfiles: always regenerate from scratch (`rm -rf node_modules package-lock.json`), otherwise you inherit the missing optional SWC binaries and the build fails with *Failed to load SWC binary*.
- The root `Dockerfile` and `Dockerfile-slim` build nothing (the root has no `next`): the real image comes from `cms/Dockerfile` via `docker-publish.yml` (`NC-27`).
- The `@nextcms/*` packages are not installable: they depend on versions never published to npm (`NC-51`). That is why CI has no `packages` job.
- The `cms/.env.example` credential has been removed from the file but is still in the git history: it must be **rotated** (`NC-5`).

## Roadmap

Sequential milestones in `BACKLOG.md`: **M0** green build OK (`v0.5.0`) -> **M1** security OK + **M2** correct APIs OK (`v0.6.0`) -> **M3** working auth (`v0.8.0`) -> **M4** content and page builder (`v0.9.0`) -> **M5** admin (`v0.10.0`) -> **M6** road to 1.0 (`v1.0.0`). Separately **M0b** (`v0.5.2`) for the npm packages. Do not open items from a later milestone until the previous one is closed.

## Pointers

- Todos: `BACKLOG.md` (`NC-n`) · Releases: `CHANGELOG.md` · Docs: `docs/` · CI: `.github/workflows/` (`ci.yml`, `codeql.yml`, `docker-publish.yml`) · Env: `cms/.env.example`
