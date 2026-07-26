# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning is [Semantic Versioning](https://semver.org/). **Every feature = one `vX.Y.Z` tag** with its own section below.

## [0.11.2] - 2026-07-26

Documentation audit rather than a rewrite: every claim was checked against the code, and this section lists what was **wrong**, not just what was added.

### Fixed

- **`CLAUDE.md` claimed there was no test suite.** It said *"There is no test suite for `cms/`/`admin/` yet"* — false since v0.6.0. There are 154 tests in `cms`, 18 in `admin` and 24 for the repo scripts. The gate now reads `lint`, `test` and `build`.
- **The status section described work finished two releases earlier** as still remaining: content management (NC-41), page builder persistence (NC-42) and the admin panel (NC-43, NC-44, NC-54) were all listed as "what remains". It also claimed 54 backlog items when there are 85, and cited NC-54 as an open decision after it shipped in v0.10.0. Rewritten from counts computed out of `BACKLOG.md`: **62 of 85 closed**, per-milestone.
- **The roadmap said M5 ships as `v0.9.0`** in both `CLAUDE.md` and the docs site; it shipped as `v0.10.0`, and it is 4/6 rather than done. It also omitted M7 and did not say that M7 is the one milestone that is *not* sequential.
- **The data model line predated three columns**: `authorId`, `Component.position` and what `publishedAt` now means (drafts *and* future-dated schedules).
- **The commands block had no `npm test`**, and did not mention that `admin` needs `CMS_ORIGIN` at build time.
- **The editor-screens list appeared twice** in the architecture section.

### Added

- Documentation for what the last three releases changed but never wrote down:
  - **Pagination** as an API contract on the docs site: the parameters, the cap of 100 and why it exists, the `meta` shape, and the note that `data` is still the array so an older client keeps working.
  - **The archive routes** `/posts`, `/category/<slug>` and `/tag/<slug>`, including that an unknown slug is a 404 rather than an empty list.
  - Two status rows — archives & feed, and authorship (marked *usable*, since permissions still ignore the author).
  - `CLAUDE.md` and `AGENTS.md` entries for the modules added since they were last touched: `pagination.ts`, `visibility.ts`, `redirect.ts`, `slug.ts`, `http.ts`, `validation.ts`, `env.ts`, `archive.ts`, `page-content.ts`, and `CMS_ORIGIN` for the panel.
  - An explicit note that **nothing has been exercised against a live database** — true of every release so far, and worth stating in the docs rather than only in changelog entries.

### Verification

The audit was mechanical where it could be: the route, module, model and environment-variable inventories were taken from the filesystem and the schema and compared with what the docs assert; the backlog counts were computed rather than counted by hand; every `lib/**` path cited in `CLAUDE.md` was checked to exist. `html-validate`, the anchor check and `stylelint` all pass.

## [0.11.1] - 2026-07-26

### Added

- **An Atom feed at `/feed.xml`** (NC-84), built test-first: 13 tests before a line of implementation. A CMS with a `post` type and a `publishedAt` had everything a feed needs and published neither.

  **Atom rather than RSS 2.0**, for one practical reason: RSS requires RFC-822 dates, which are locale-sensitive to format by hand and a classic cause of feeds that break for some readers only. Atom uses RFC 3339, which is `toISOString()`.

  Decisions the tests pin down:
  - Only `type=post` is included. Pages are a site's furniture; posts are what someone subscribes to.
  - Capped at 50 entries — an unbounded feed grows until it is too big to fetch.
  - `updated` is the newest entry's date, **not** the current time. A feed whose `updated` moves on every request tells a reader that everything changed, every time.
  - With no `BASE_URI` it answers **503** instead of serving relative links. Atom requires absolute URLs and a feed is read away from the site that served it, so that document would be broken rather than merely degraded.
  - Drafts, scheduled and soft-deleted content are excluded by the same predicate the renderer and the sitemap use.

- **Feed discovery**: a `rel="alternate" type="application/atom+xml"` link in every content page's head. A feed nobody can find is not a feature.

### Verification

Beyond the 13 unit tests, a feed was generated with deliberately hostile input — `&`, `<`, `>`, `"` and `'` in the title, summary and slug, plus a draft — written to disk and checked with `xmllint`: **well-formed**, the escaping intact, and no trace of the draft. That is the check that matters, because a single unescaped ampersand makes the whole document unparseable rather than just its own entry.

| | typecheck | lint | tests | build |
|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ 154 passed | ✅ |

`/feed.xml` appears in the build output. Not verified against a live database.

### Still open in M7

Four of the eight: the authorable 404 (NC-81), the trash (NC-82), caching on public routes (NC-83) and a health endpoint (NC-85).

## [0.11.0] - 2026-07-26

Three M7 items, in the order they were recommended: author, pagination, archives. The first two changed contracts, so they came before there is much content or many clients.

### Added

- **Content has an author** (NC-79). `Page.authorId` with a nullable relation to `User` — nullable because rows created before this have none, and deleting a user must not delete their content.

  Two decisions worth naming. The author is taken **from the session, never from the payload**, so a client cannot publish under someone else's name. And it is exposed through a projection *narrower* than `publicUserSelect`: content listings are public, and an author's email address has no business being in one, so only what a byline needs is included.

  `?author=me` answers the "my drafts" case, and the admin content list gained an Author column.

- **Every list endpoint paginates** (NC-78). Built test-first: 20 tests for `lib/utils/pagination.ts` before a line of implementation, then applied to pages, users, roles, components, categories and tags.

  `?page` and `?perPage`, capped at 100 — the cap is the point, since `?perPage=100000` would otherwise be the same unbounded request this replaced. The count comes from the same `where` in the same round trip. The envelope gains `meta` and `data` stays the array, so a client that ignores pagination keeps working.

  The type system earned its keep here: changing the repo return shape surfaced all eight call sites that assumed an array, including the admin dashboard, whose counts now read `meta.total` rather than the length of one page.

- **Archive pages** (NC-80): `/category/<slug>`, `/tag/<slug>` and `/posts`, paged and sharing one presentation so the three cannot drift apart. Categories and tags could be created, assigned and filtered through the API, and no public page listed content by either — a visitor could only reach content by its exact slug.

  An unknown slug is a **404, not an empty list**: otherwise every typo'd URL would render a real-looking archive that happens to be empty. Drafts and scheduled content are excluded through the same `publishedOnly` path as the API, and the archive URLs are now in `sitemap.xml`.

### Changed

- The content list is ordered newest-first (`publishedAt desc`) rather than by id ascending: a content list is read from the top.
- `publishedOnly` filters `publishedAt <= now` rather than merely "not null", so a scheduled post stays out of listings until its time — the rule `isPubliclyVisible` already applied to single pages.

### Verification

| | typecheck | lint | tests | build |
|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ 141 passed | ✅ |
| `admin` | ✅ | ✅ | ✅ 18 passed | ✅ |

The three archive routes appear in the build output. Not verified against a live database: the queries are checked by the type system and `prisma validate`, and **the new column and indexes need `prisma db push` before this release runs**.

### Still open in M7

Five of the eight items added in 0.10.2 remain: the authorable 404 (NC-81), the trash (NC-82), caching on public routes (NC-83), a feed (NC-84) and a health endpoint (NC-85). NC-84 is cheap now that the archive query exists.

## [0.10.2] - 2026-07-26

### Added

- **Eight more items in M7 · Product** (NC-78 … NC-85), bringing it to 18. As before, each one is grounded in something checked in the code rather than taken from a list of things CMSes have. The four that matter most:

  - **NC-78** 🟠 — **no list endpoint paginates.** All eleven `findMany` calls in the repo layer run without `take`/`skip`, so `GET /api/page`, `/api/user` and the taxonomies each return the whole table and the admin screens render all of it. Invisible at twenty rows, a denial of service at twenty thousand.
  - **NC-79** 🟠 — **content has no author.** `Page` has no `authorId` and no relation to `User`; the only trace of the idea is a commented-out example at the bottom of the schema. No "my drafts", no "who published this", and no ownership to scope permissions by — which is also what makes NC-63 hard to finish.
  - **NC-80** 🟠 — **categories and tags lead nowhere.** They can be created, assigned and filtered through the API, and no public page lists content by either: a visitor can only reach content by its exact slug. The archive routes are the missing half of the taxonomy work shipped in v0.8.0.
  - **NC-83** 🟡 — **every public page request hits the database.** All content routes are server-rendered with no `Cache-Control`; the sitemap and robots routes are the only two places in the app that set one.

  Also: an authorable 404 (NC-81), a trash for the soft-deleted rows that currently accumulate where only a database client can see them (NC-82), a feed (NC-84), and a health endpoint for the image published to ghcr.io, which today has nothing an orchestrator can probe (NC-85).

### Verification

Each item was checked before being written, not assumed: `grep` for `take`/`skip` across the repo layer (0 of 11), for `authorId` in the schema (only in a comment), for archive routes and `pages/404.tsx` (absent), for `Cache-Control` outside the sitemap and robots routes (none), for a restore path (none), and for a health endpoint or `HEALTHCHECK` (neither).

## [0.10.1] - 2026-07-26

### Added

- **Releases are published automatically** (NC-77). Ten tags existed and the Releases page was empty. `.github/workflows/release.yml` now publishes a release for every `v*` tag, taking the body from the matching `CHANGELOG.md` section.

  The notes come from the changelog and not from commit messages, because the changelog already records what was verified and what was not — a commit log does not. A tag whose version has **no** changelog section **fails the workflow** rather than publishing an empty release: this project's rule that every tag has a changelog section is now enforced instead of trusted. Re-running on an existing release refreshes its notes, so a corrected changelog can be republished.

  `--prerelease` is set only for a semver prerelease suffix. Marking every `0.x` tag as a prerelease — which is all of them so far — would make the flag meaningless.

- 12 tests for the extractor, run in the release workflow before anything is published and in CI alongside the backlog parser (24 repo-script tests in total). One of them runs against the real `CHANGELOG.md` and asserts that every version's section is non-empty and does not leak into the next one.

### Note

The `--prerelease` flag is passed as a plain string rather than a bash array. Expanding an empty array under `set -u` is an error in bash 3.2, and while the runners ship bash 5, depending on that is the kind of assumption that only fails in CI. Verified under bash 3.2, which is stricter than the runner.

**When these tags are pushed, one release per tag will be created** — ten of them at once for the existing history. That is the intended backfill, but it is worth knowing before the push.

## [0.10.0] - 2026-07-26

Most of **M5 · Admin**. The panel had one page whose entire body was the string `TODO ADMIN STUFF`; it is now a working surface with a session.

### Added

- **The panel shell and four screens** (NC-43): navigation, the signed-in user, and a dashboard of counts. Screens for **users**, **roles**, **categories** and **tags** — none of which had a UI anywhere before. The users screen is the only place in the product that can create a privileged account, since self-registration can never set the role flags.
- **`lib/crud/AdminAPI.ts`** (NC-44): the panel's only route to the cms API. It unwraps the response envelope and turns a failure into an `ApiError` carrying its status, so a screen can tell *your session expired* (401) from *you are not an administrator* (403) — the dashboard shows a dash rather than a zero for counts the API refuses.
- Jest in the admin app with 18 tests, wired into CI along with an `npm test` step for `admin` that was missing.

### Changed

- **Session sharing between the two apps** (NC-54). Neither option in the original note was needed, because its premise was wrong: **cookies are scoped by host, not by port** (RFC 6265), so the HttpOnly `access_token` set on `localhost:3000` is already sent to `localhost:4000`.

  What was actually missing was the API path. The panel now calls same-origin `/admin/api/*`, which a Next rewrite proxies to the cms — so the browser attaches the cookie and the rewrite forwards it upstream. No CORS to configure, and no token in `localStorage` to steal. The panel's middleware sends a visitor with no cookie to the cms login, and the cms login honours `?next=`.

  Both ends of that round trip are open-redirect surfaces, and both were built test-first. `safeReturnTo` in the panel refuses anything that is not a same-origin path; `safeRedirectTarget` in the cms additionally allows exactly one absolute origin — the configured `ADMIN_URL`, so the trip works across ports in development. It compares parsed origins rather than string prefixes, which is what makes `http://localhost:4000.evil.example` and `http://localhost:4000@evil.example` fail.

- **`admin` dependencies trimmed** (NC-36): 54 devDependencies and 3 runtime dependencies removed, **900 packages down to 521**. The Metronic sass tree was already dead code — its imports are commented out in `_app.tsx` — and `pg`, `reflect-metadata` and `sass-loader` were never used at all. `bootstrap` and `bootstrap-icons` moved to `dependencies`, where a stylesheet the build imports belongs.

### Removed

- The copies of `cms` code that the panel carried and never used: `DynamicComponents`, `Elements/*`, the page-builder components, the redux store, the duplicated types and `fetchWrapper`. Also the committed `tsconfig.tsbuildinfo`, now ignored.

### Not done

- **NC-58** — the second half of the page builder (per-block settings, media, nested blocks) is untouched, so M5 is **not** closed. It needs a media story first, which is NC-61 in M7.
- **NC-76**, new — there are now two editing surfaces: the content forms and page builder in `cms/`, the panel in `admin/`, which links across to them. Duplicating those forms would have meant two implementations of the same validation, so the panel links instead. Deciding which app owns authoring, and moving the screens once, is follow-up work.
- The vendored `src/_metronic` theme (82 files) is kept but excluded from the typecheck: adopting it means restoring the ten packages it imports.

### Verification

| | typecheck | lint | tests | build |
|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ 122 passed | ✅ |
| `admin` | ✅ | ✅ | ✅ 18 passed | ✅ |

Not verified: no browser has exercised the login round trip or the API proxy — no database is available here, so the flow is covered by the unit tests on both redirect guards and by the type system, not by a request.

## [0.9.1] - 2026-07-26

Work on a Vercel build failure. **The reported failure was not reproduced**, and this release says so rather than claiming a fix — but the investigation found three real defects, two of them mine, and they are fixed.

### Fixed

- **Prisma upgraded 3.15 → 5.22** (NC-74). Prisma 3.15 shells out to the `openssl` binary to pick a query engine; when that binary is absent it resolves the platform to `linux-<arch>-openssl-undefined` and **throws**, three seconds into a build. Reproduced on `node:24-bookworm-slim`. Prisma 5 downgrades that to a warning and generates successfully.

  Declaring `binaryTargets` explicitly does **not** avoid it — detection of the current platform runs regardless. That was tested, not assumed.

  Prisma 5 rather than 6: 6 requires TypeScript ≥5.1, and this codebase is on 4.9, so it would have dragged a second major upgrade behind it. One code change was needed — `PrismaClientKnownRequestError` takes an options object again from Prisma 4 onwards, which is the Prisma 3 signature reversed.

- **`cms/vercel.json` no longer pins a bare `npm ci`** (NC-75). Under `NODE_ENV=production`, which build environments commonly set, `npm ci` omits devDependencies: **144 packages instead of 900**, with none of `tsc`, `prisma` or `next` installed — a build that dies in seconds. Both counts were measured in a container. Now `npm ci --include=dev`, so the install cannot depend on an environment variable. This landmine was introduced in v0.8.3, by me.

- **`prisma -v` removed from the build script.** It was added in v0.8.3 as a diagnostic and is worse than useless: it runs the *schema* engine, which fails to load where the *query* engine used by `prisma generate` works fine. It can turn a passing build into a failing one — demonstrated, not theorised.

- **`next telemetry disable` removed from the build script.** Vercel, CI and the Dockerfile all set `NEXT_TELEMETRY_DISABLED` already, and the command writes a config file, so it was one more thing that could fail for no benefit.

### Verification

The app was built in a container that matches Vercel's shape — `node:24-bookworm-slim`, Linux, a fresh `npm ci` of 900 packages, `NODE_ENV=production` — and **it builds cleanly**, with both the old and the new build script:

```
INSTALL_EXIT=0 (added 900 packages)
BUILD_EXIT=0
```

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 pre-existing warning) | ✅ 106 passed | ✅ |

### What is still unknown

**The cause of the reported Vercel failure.** The pasted log ends at `Running "npm run build"`, and the error lines come after that. Five hypotheses were tested and three were refuted:

| Hypothesis | Verdict |
|---|---|
| Node version rejected (`14.x`) | Fixed in v0.8.4 — the log confirms it is gone, and Next 12.1.1 is detected |
| devDependencies missing from the install | Refuted: the log shows 897 packages, a full install |
| `NODE_ENV=production` breaks the build | Refuted: reproduced locally, builds fine |
| `next telemetry disable` fails | Refuted: builds fine in a faithful container |
| Prisma cannot detect OpenSSL | Real and fixed, but not reproducible as *Vercel's* failure |

## [0.9.0] - 2026-07-26

First two items of **M7 · Product**, both built test-first.

### Added

- **SEO output** (NC-60). `seoTitle`, `seoDescription` and `jsonld` had been in the schema since the first release and the editor had been storing them for two milestones, while `next/head` appeared nowhere in the codebase: public pages shipped no title, no description and no structured data.

  `lib/utils/seo.ts` resolves it all — title and description with a fallback chain where a blank stored value counts as absent, canonical URL, Open Graph (`article` for a post, `website` for a page) and validated JSON-LD. `components/Seo.tsx` writes the tags, and both public routes use it.

  Two behaviours worth calling out, both pinned by tests:
  - A draft or a page dated in the future gets `noindex,nofollow`, derived from the same visibility predicate the renderer and the sitemap use, so the three cannot disagree.
  - Stored JSON-LD is parsed before use — malformed input yields no tag instead of throwing mid-render — and its closing tags are escaped. Without that, an editor storing `</script>` in a field would end the script element and have everything after it become live markup.

- **`sitemap.xml` and `robots.txt`** (NC-69), served from `pages/sitemap.xml.ts` and `pages/robots.txt.ts` and generated per request, so a newly published page appears without a rebuild. Drafts, scheduled and soft-deleted content are excluded by the shared predicate. Slugs are XML-escaped: one unescaped ampersand would make the whole document unparseable rather than just its own entry. Entries are ordered by slug so the document is byte-stable between fetches.

- `SITE_NAME` (optional, defaults to `NextCMS`) for `og:site_name`, and a lean `listSitemapEntries` projection so the sitemap does not pull the taxonomy relations of every page.

- 34 tests (106 total).

### Method

Written **test-first**, in that order:

1. `__tests__/seo.test.ts` and `__tests__/sitemap.test.ts` were written against modules that did not exist.
2. The suite was run and **failed** — `Cannot find module '../lib/utils/seo'`, 2 suites failing, 7 passing.
3. The implementations were written to satisfy those tests.
4. The suite went green at 106 passing.

The red step is the reason two of the rules above exist at all: writing the JSON-LD test made the `</script>` break-out obvious before any code was written, and the XML-escaping test made it clear that one bad slug should not be able to take the whole sitemap down.

### Changed

- The roadmap: M7 ships item by item rather than as one release, so each entry records the version it landed in, and M5 moves to `v0.10.0`.

### Verification

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 pre-existing warning) | ✅ 106 passed | ✅ |

`/sitemap.xml` and `/robots.txt` appear in the build output as server-rendered routes. Not verified: nothing was exercised against a live database or a running server, so the rendered head and the served documents are covered by the unit tests and the type system, not by an HTTP response.

## [0.8.5] - 2026-07-26

### Changed

- **The documentation site got a visual identity** (NC-73). The first version was readable but flat, and one flaw mattered more than looks: **every status pill rendered the same grey**, so "working" and "placeholder" were indistinguishable — the opposite of the point of an honest status table.
  - An SVG mark of three stacked blocks — what a page actually is in this CMS — used as the logo and the favicon. It stays legible at 16px.
  - A hero panel with the mark, the tagline, the badges and three calls to action (Quick start, API reference, GitHub).
  - The three parts of the repository as cards rather than a bare table.
  - **Status pills coloured by meaning**: green works, blue works with caveats, amber unfinished, red absent.
  - Sidebar highlights the section in view (IntersectionObserver, ~25 lines, progressive enhancement — the site is fully usable with JavaScript off).
  - `og:`/`twitter:` meta so a shared link looks intentional.
  - On narrow screens the nav is capped at 45vh and scrolls, instead of pushing the page below twenty links. CSS only: an earlier attempt added a `<details>` toggle whose body was empty, which would have shown a control that opened nothing.

### Added

- Stylesheet and SVG linting to the Pages workflow, with `docs/.stylelintrc.json`.

### Verification

Reviewed by rendering the page headless and **looking at it** — dark theme, light theme (by disabling the dark media query in a copy, since headless inherits the host theme) and a narrow viewport. That is also how two defects were caught that no validator would have flagged: the empty disclosure above, and a dead duplicate `.sidebar .brand` rule that stylelint then confirmed.

One measurement worth recording: the narrow-viewport screenshot appeared to clip the hero, which looked like horizontal overflow. Measuring `documentElement.scrollWidth` against `innerWidth` showed **500 = 500** — no overflow. Chrome on macOS clamps a headless window to 500px wide, so a 390px screenshot was cropping the image, not the layout. The widest element is a table, and it scrolls inside its own container as intended.

`html-validate` 0 errors · anchors 16/16 resolve · stylelint 0 problems · `xmllint` on the SVG clean.

## [0.8.4] - 2026-07-26

### Fixed

- **The deploy died on the Node version** (NC-72), with a version nothing in the repository asked for:

  ```
  Found invalid or discontinued Node.js Version: "14.x".
  Please set Node.js Version to 24.x in your Project Settings to use Node.js 24.
  ```

  Vercel resolves `engines.node` from the `package.json` **at the project's Root Directory**, and falls back to the dashboard setting when it finds none there. The root manifest had no `engines` block, so the stale `14.x` in the dashboard kept winning and the deploy stopped right after cloning, before installing anything.

  This also explains why **the v0.7.3 fix could not have worked**: it added `engines` to `cms/package.json` and `admin/package.json`, and those manifests were never the ones being read. The root manifest now declares `24.x` as well.

### Added

- `.github/scripts/check-engines.mjs` and a `manifests` job in CI: the three manifests must declare the same Node version, and the build fails if they drift. This bug has already recurred once — a guard is cheaper than diagnosing it a third time. Verified in both directions: it passes as things stand, and fails with a clear message when `engines` is removed from the root manifest.
- A **Node version** subsection on the documentation site explaining where Vercel actually reads it from, plus the three dashboard settings a new project needs, in order.

### Changed

- The root `package.json` is now `private: true`. It exists only so tooling can read `engines`; it is not a publishable package, and `private: false` with no name left an accidental `npm publish` from the root possible.

### Still needed in the dashboard

The two settings git cannot express — and the deploy needs both:

1. **Root Directory** → `cms` (NC-71). The repository root has no `next` dependency and no build script.
2. **Node.js Version** → `24.x`. The manifests override it now, but leaving a discontinued version there is what produced the failure above.

### Verification

`check-engines.mjs` passes across all three manifests and exits 1 with an explicit message when the root `engines` is removed. HTML and anchors on the docs site still validate. Not verified: no deploy has been run, so whether Vercel now gets past this point is unconfirmed — but the cause of *this* error is identified precisely rather than guessed at, which was not true of the previous release.

## [0.8.3] - 2026-07-26

### Fixed

- **The Vercel build failed** (NC-70). `cms/package.json` never ran `prisma generate`. The generated client lives in `node_modules/.prisma`; Vercel restores `node_modules` from its build cache, so the `@prisma/client` postinstall that normally generates it does not run on a cached build. The client is then absent and the build dies while type-checking:

  ```
  Type error: Module '"@prisma/client"' has no exported member 'Prisma'.
  ```

  The build script now generates it explicitly:

  ```
  "build": "next telemetry disable && prisma generate && next build"
  ```

  `prisma generate` needs neither a reachable database nor `DATABASE_URL`, so this is safe at build time — verified by running it with the variable unset.

### Added

- `cms/vercel.json`: pins the framework to Next.js and the install to `npm ci`, so a deploy installs from the lockfile rather than resolving fresh.
- A **Deploying** section on the documentation site: the Vercel settings for both apps, why the build command generates the Prisma client, the Docker situation, and the fact that nothing in the pipeline runs `prisma db push` for you.

### Note on what could not be fixed in git

`engines.node: "24.x"` is **not** the problem — Vercel's current versions are 24.x (default), 22.x and 20.x, so 24.x is valid. That was checked against Vercel's documentation rather than assumed.

**NC-71** is opened rather than closed: Vercel's **Root Directory must be set to `cms`** in the dashboard (and `admin` for the panel). The repository root has no `next` dependency and no build script, so a project pointed at it cannot build, and `vercel.json` cannot express Root Directory for a Next app in a subdirectory. Restructuring into npm workspaces (NC-38) would make the root buildable and remove the invisible setting.

### Verification

The failure was **reproduced** locally — `rm -rf .next node_modules/.prisma` then `npm run build` exits 1 with the type error above — and the fix verified from that same state: the build regenerates the client and exits 0. A first attempt appeared to pass because the `.next` cache masked the missing client, which is worth knowing when testing this again.

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 pre-existing warning) | ✅ 72 passed | ✅ |

Not verified: no deploy has been run. Whether this was *the* failure the deploy hit is unconfirmed — the Vercel build log was not available, so two likely causes were addressed: one fixed and proven, one documented as a required setting.

## [0.8.2] - 2026-07-26

### Fixed

- **Drafts were served publicly** (NC-59). `GET /api/page` filtered on `publishedAt`, but the page renderer did not: `loadPage` checked only `deletedAt`, so an unpublished page was rendered to anyone who knew its slug. Introduced in v0.8.0 by the same change that added drafts — the API grew the filter and the renderer did not.

  The rule now lives in one Prisma-free predicate, `isPubliclyVisible` in `lib/utils/visibility.ts`, so the two paths cannot disagree again. It also treats a `publishedAt` in the future as not-yet-published, which makes scheduled publishing work rather than leaking early. `loadPage` takes an `includeDrafts` option for the editor preview that NC-67 will add.

### Added

- **Milestone M7 · Product** in `BACKLOG.md`: the first milestone about making the project *good* rather than *correct*, with ten items (NC-60…NC-69). Every one is grounded in something that exists in the code today, not in a wish list. The three that stand out:
  - **NC-60** — SEO fields are collected and never emitted. `seoTitle`, `seoDescription` and `jsonld` have been in the schema from the beginning and the editor stores them, but `next/head` appears **nowhere in the codebase**: public pages ship no `<title>`, no meta description and no structured data.
  - **NC-63** — `Role` has no effect on anything. Authorisation reads the `isAdmin`/`isStaff` booleans; `Role` rows are created and listed through a full CRUD API and then ignored. It is an API that pretends to control access.
  - **NC-64** — `Entity` is dead code: the model and its repo exist, nothing imports them, there is no route and no UI.
- Six regression tests for the visibility predicate (72 total).

### Changed

- M7 is marked as **not sequential** in the roadmap, unlike M0–M6: it is a product backlog to be picked from by need.

### Verification

| | `prisma validate` | `tsc --noEmit` | lint | tests | build |
|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ (1 pre-existing warning) | ✅ 72 passed | ✅ |

The backlog parser reads 69 items across 9 milestones. Not verified: the draft fix was not exercised against a live database — the predicate is unit-tested, its integration with Prisma is checked by the type system only.

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
