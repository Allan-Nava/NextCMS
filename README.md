# NextCMS

A headless-ish content management system built on **Next.js 12 + TypeScript + Prisma**. Pages are data, not code: content lives in the database and the renderer composes it from a registry of React components.

📖 **Documentation: [allan-nava.github.io/NextCMS](https://allan-nava.github.io/NextCMS/)**

> **Work in progress.** Build, authentication and the content API work and are covered by tests; the admin panel is still a placeholder and no mail provider is wired. The [project status](https://allan-nava.github.io/NextCMS/#status) section says exactly what does and does not work.

## What is in this repository

Three independent parts — this is not an npm workspace, so each folder installs and builds on its own:

| Part | What it is | Port |
|---|---|---|
| `cms/` | The public site and the whole HTTP API. Owns the Prisma schema. | 3000 |
| `admin/` | Admin panel on the Metronic theme, served under `/admin`. Talks to the `cms/` API, no database access. | 4000 |
| `packages/` | The `@nextcms/*` npm packages: a Koa-based CLI and scaffolder. Currently not installable — see `NC-51`. | — |

## Quick start

Node 24 and a PostgreSQL database.

```bash
git clone https://github.com/Allan-Nava/NextCMS.git
cd NextCMS/cms
npm ci

cp .env.example .env       # fill in DATABASE_URL and JWT_SECRET

npx prisma generate
npx prisma db push
npm run dev                # http://localhost:3000
```

See [Quick start](https://allan-nava.github.io/NextCMS/#quick-start) for the admin app, the first-user problem and the full environment reference.

## Development

```bash
cd cms
npm run lint
npm test                   # 66 unit tests
npm run build
```

CI gates typecheck, lint, tests and build on both apps for every push.

## How work is tracked

- **[`BACKLOG.md`](BACKLOG.md)** is the single source of todos, with stable `NC-n` ids. A push that touches it syncs the items to GitHub issues and its sections to milestones, so ticking an item in the file closes its issue.
- **[`CHANGELOG.md`](CHANGELOG.md)** has one section per tagged release, including what was verified and what was not.
- Contributor and agent conventions live in [`CLAUDE.md`](CLAUDE.md) and [`AGENTS.md`](AGENTS.md).

## License

[MIT](LICENSE) © Allan Nava
