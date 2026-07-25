# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate qui.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il versionamento è [Semantic Versioning](https://semver.org/lang/it/). **Ogni feature = un tag `vX.Y.Z`** con la sua sezione qui sotto.

## [0.5.0] - 2026-07-26

Milestone **M0 · Build verde** chiusa: `cms` e `admin` installano, typecheckano, lintano e buildano. Prima di questa release il progetto non era nemmeno installabile.

### Corretto

- **`cms/prisma/schema.prisma`** (NC-24): la relazione `Visit → Page` riusava la primary key di `Visit` come foreign key e non dichiarava il campo opposto su `Page`, quindi `prisma generate` falliva con P1012. Ora `Visit.pageId` + `Page.visits Visit[]`, con indice dedicato e `createdAt`. `@@index([title], map: "title")` sostituisce l'argomento `name` deprecato.
- **Campi obbligatori mancanti nelle create** (NC-25): `type` in `pagesRepo.create` (default `"page"`) e in `prisma/seed.ts`; `template` e `data` in `componentRepo.create`.
- **Conflitti di peer dependency** (NC-50): `npm install` falliva con ERESOLVE in entrambe le app. `@popperjs/core` da `~2.10.1` a `^2.11.8` (lo pretende bootstrap 5.3.x), coppia apexcharts allineata (`apexcharts@^3.41.0`, `react-apexcharts@~1.5.0`: la 1.9 pretende apexcharts 4).
- **Build sass rotta** (NC-52): `bootstrap: "^5.1.3"` floatava a 5.3.x, che ha spostato `$theme-colors-rgb` in `_maps.scss`; la sequenza di import di Metronic in `styles/sass/_init.scss` è quella di 5.1 e il build moriva con `SassError: Undefined variable`. Pin a `~5.1.3`.
- **`cms/Dockerfile`** (NC-49): riscritto. Partiva da `node:17.4-stretch` (tag inesistente, distro archiviata), faceva `apt -y install curl` senza `apt-get update`, non eseguiva mai `prisma generate` — il postinstall di `@prisma/client` girava prima che lo schema fosse nell'immagine — e lo stage di produzione copiava le dipendenze senza il client generato. Ora `node:18-bullseye-slim` (OpenSSL 1.1, richiesto dagli engine di Prisma 3), `npm ci`, `prisma generate` esplicito e copia di `node_modules/.prisma` nel runtime.
- **`componentRepo.create`** (NC-21): salvava `property: bodyComponent.toString()`, cioè `"[object Object]"`. Ora `JSON.stringify`, come già faceva l'`update`.

### Aggiunto

- `cms/package-lock.json` (NC-26): `cms/` non aveva alcun lockfile.
- `jest` e la sua configurazione in `packages/core/nextcms` (NC-48), che dichiarava `test:unit: jest` senza averlo tra le dipendenze.

### Modificato

- `admin/package-lock.json` rigenerato: quello committato era lockfileVersion 2 e ometteva i binari SWC opzionali, quindi `npm ci` produceva un albero senza `@next/swc-darwin-arm64` e il build falliva con *Failed to load SWC binary*.
- `.github/workflows/ci.yml`: `npm ci` con cache npm per entrambe le app, ora che i lockfile esistono. Rimosso il job `packages`, che non può girare finché NC-51 è aperto.

### Nuovi item di backlog

- **NC-51** 🔴 — `@nextcms/nextcms` dipende da versioni dei propri fratelli mai pubblicate su npm (`@nextcms/generators@0.1.4`, `@nextcms/utils@0.1.10`): `npm install` fallisce con `notarget`, quindi il pacchetto pubblicato `@nextcms/nextcms@0.1.19` non è installabile da nessuno. Apre la milestone M0b.
- **NC-52** — pin di bootstrap (vedi sopra).

### Verifica

Sequenza eseguita in locale su installazione pulita (`npm ci`), identica a quella della CI:

| | `npm ci` | `prisma validate` | `prisma generate` | `tsc --noEmit` | lint | build |
|---|---|---|---|---|---|---|
| `cms` | ✅ | ✅ | ✅ | ✅ | ✅ (1 warning) | ✅ |
| `admin` | ✅ | — | — | ✅ | ✅ (1 warning) | ✅ |

## [0.4.0] - 2026-07-25

### Aggiunto

- `.github/workflows/ci.yml`: primo gate di qualità del repo (NC-29). Tre job — `cms` (install, `prisma validate`, `prisma generate`, `tsc --noEmit`, lint, build), `admin` (install da lockfile, typecheck, lint, build), `packages` (unit test di `@nextcms/nextcms`). Sono gate bloccanti: restano rossi finché la milestone M0 non è chiusa.
- `cms/.eslintrc.json` e `admin/.eslintrc.json` (NC-47): senza una config per app, `next lint` in CI sarebbe partito in modalità setup interattiva. La config di root non è risolvibile dalle app perché i plugin sono installati dentro `cms/` e `admin/`.
- `BACKLOG.md`: roadmap a sei milestone sequenziali (M0 build verde → M6 strada per 1.0) con la release di destinazione di ciascuna e la definition of done.

### Modificato

- `.github/workflows/codeql.yml` (NC-45): `codeql-action` da v2 (ritirata da GitHub a gennaio 2025, la workflow falliva sempre) a v3, linguaggio `javascript-typescript`, query `security-and-quality`, `checkout@v4`.
- `.github/workflows/docker-publish.yml` (NC-46): riscritta. Usava `::set-output` — comando disabilitato da GitHub — e un blocco bash fatto a mano per i tag; ora il tagging lo fa `docker/metadata-action@v5`, con action aggiornate e cache buildx.

### Rimosso

- `.github/workflows/cypress.yml` (NC-30): girava a ogni push ma nel repo non esistono test Cypress né la configurazione — buildava e avviava `cms/` a vuoto. L'E2E rientra con NC-31.

### Nuovi item di backlog

- NC-45 (CodeQL v2 ritirata), NC-46 (`::set-output` in docker-publish), NC-47 (ESLint per app), NC-48 (`jest` non installato in `@nextcms/nextcms` ma richiamato da `test:unit`), NC-49 (`cms/Dockerfile` non esegue `prisma generate` prima della build).

## [0.3.0] - 2026-07-25

### Aggiunto

- `CLAUDE.md` e `AGENTS.md`: regole operative, architettura, comandi e trappole note del repository.
- `BACKLOG.md`: sorgente unica dei todo con id stabili `NC-n`, popolato dall'audit del codice sul commit `7ac0299` (44 item su sicurezza, bug API, schema Prisma, CI, debito tecnico e feature).
- `CHANGELOG.md` (questo file) e la regola **una feature = un tag**.

### Modificato

- `TODO.md` è ora un puntatore a `BACKLOG.md`, che diventa la sorgente unica dei todo.

## [0.2.11] e precedenti

Rilasci precedenti all'adozione del changelog: vedi i tag git (`git tag --sort=-v:refname`) e la history.
