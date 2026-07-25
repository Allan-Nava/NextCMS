# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate qui.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il versionamento è [Semantic Versioning](https://semver.org/lang/it/). **Ogni feature = un tag `vX.Y.Z`** con la sua sezione qui sotto.

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
