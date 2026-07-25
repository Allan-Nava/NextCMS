# BACKLOG — NextCMS

Sorgente unica dei todo. Ogni item ha un **id stabile `NC-n`**: gli id non si riusano e non si rinumerano, anche se l'item cambia milestone. Si spunta `[x]` quando la cosa è fatta *e* rilasciata (tag + riga nel [`CHANGELOG.md`](CHANGELOG.md)).

Stato iniziale popolato dall'**audit del 2026-07-25** sul commit `7ac0299`.

Legenda severità: 🔴 critico · 🟠 alto · 🟡 medio · ⚪ debito.

---

## Roadmap

Le milestone sono **sequenziali**: ognuna ha senso solo se la precedente è chiusa. La regola è una sola — non si costruiscono feature sopra un progetto che non compila, e non si mette in rete un'auth che perde gli hash.

| # | Milestone | Obiettivo | Release | Item |
|---|---|---|---|---|
| **M0** | Build verde (app) | `prisma generate`, `tsc`, `next build` passano su cms e admin, e la CI lo verifica | `v0.5.0` ✅ | NC-24…26, 29, 30, 45…47, 49, 50, 52 |
| **M0b** | Pacchetti npm | `@nextcms/*` installabili e testabili | `v0.5.1` | NC-48, NC-51 |
| **M1** | Sicurezza | Nessun segreto in giro, niente hash password nelle risposte, route protette | `v0.6.0` | NC-1…10 |
| **M2** | API corrette | Ogni endpoint risponde, con lo status giusto e i dati giusti | `v0.7.0` | NC-11…23 |
| **M3** | Auth funzionante | Login/logout/register end-to-end, sessione propagata a cms e admin | `v0.8.0` | NC-39, NC-40 |
| **M4** | Contenuti e page builder | Pagine e componenti creabili, salvabili e renderizzati dal DB | `v0.9.0` | NC-34, 35, 41, 42 |
| **M5** | Admin | Il pannello smette di essere un placeholder | `v0.10.0` | NC-36, 43, 44 |
| **M6** | Strada per 1.0 | Debito, test, migrazione Next | `v1.0.0` | NC-27, 28, 31…33, 37, 38 |

**Definition of done** di ogni milestone: tutti i suoi item spuntati, CI verde, sezione nel `CHANGELOG.md`, tag creato.

---

## M0 · Build verde (app) → `v0.5.0` ✅

**Chiusa.** `cms` e `admin` installano, typecheckano, lintano e buildano; la sequenza è verificata dalla CI. Il track dei pacchetti npm è separato (M0b), perché bloccato da una causa indipendente.

- [x] 🔴 **NC-24** — `cms/prisma/schema.prisma`: `Visit` dichiarava `Page Page? @relation(fields: [id], references: [id])` senza il campo opposto su `Page` → `prisma generate` falliva (P1012), e usava la primary key come foreign key. *(v0.5.0: relazione ridisegnata con `pageId` + `Page.visits Visit[]` e indice dedicato; `prisma validate` passa.)*
- [x] 🟠 **NC-25** — Campi obbligatori mancanti nelle create. *(v0.5.0: `type` aggiunto a `pagesRepo.create` (default `"page"`) e a `prisma/seed.ts`; `template` e `data` aggiunti a `componentRepo.create`.)*
- [x] 🟠 **NC-26** — `cms/` non aveva **nessun lockfile**. *(v0.5.0: `cms/package-lock.json` generato e `admin/package-lock.json` rigenerato — quello committato era lockfileVersion 2 e ometteva i binari SWC opzionali, quindi `npm ci` produceva un build rotto. `ci.yml` passa a `npm ci` con cache npm.)*
- [x] 🟠 **NC-29** — Nessun gate di build in CI. *(v0.4.0: aggiunta `ci.yml` con typecheck + lint + build per cms e admin, prisma validate/generate, unit test dei package.)*
- [x] 🟡 **NC-30** — `cypress.yml` girava a ogni push senza test Cypress nel repo. *(v0.4.0: workflow rimossa; l'E2E rientra con NC-31.)*
- [x] 🟠 **NC-45** — `codeql.yml` usava `codeql-action@v2`, ritirata da GitHub a gennaio 2025: la workflow falliva sempre. *(v0.4.0: portata a v3 + `javascript-typescript` + query `security-and-quality`.)*
- [x] 🟠 **NC-46** — `docker-publish.yml` usava `::set-output`, comando disabilitato da GitHub, e action v1/v2/v3: non pubblicava più. *(v0.4.0: riscritta con `docker/metadata-action@v5` e action aggiornate.)*
- [x] 🟡 **NC-47** — `cms/` e `admin/` non avevano config ESLint (solo la root, non risolvibile dalle app): `next lint` in CI sarebbe partito in modalità setup interattiva. *(v0.4.0: `.eslintrc.json` per app.)*
- [x] 🟡 **NC-49** — `cms/Dockerfile` non poteva funzionare: tag base inesistente (`node:17.4-stretch`), `apt -y install curl` senza `apt-get update`, nessun `prisma generate` (il postinstall di `@prisma/client` girava prima che lo schema fosse nell'immagine) e lo stage di produzione copiava le dipendenze senza il client generato. *(v0.5.0: riscritto su `node:18-bullseye-slim` con `npm ci`, `prisma generate` esplicito e copia di `node_modules/.prisma` nel runtime.)*
- [x] 🔴 **NC-50** — `npm install` in `cms/` e `admin/` **falliva con ERESOLVE**: `@popperjs/core` pinnato `~2.10.1` contro `bootstrap@5.3.x` che pretende `^2.11.8`, e `apexcharts@^3.27.1` contro `react-apexcharts@1.9.x` che pretende `>=4`. Il progetto non era installabile con npm 7+ senza `--legacy-peer-deps`. *(v0.5.0: `@popperjs/core` a `^2.11.8`, coppia apexcharts allineata su `^3.41.0` / `~1.5.0`.)*
- [x] 🟠 **NC-52** — `bootstrap: "^5.1.3"` floatava a 5.3.x, che ha spostato `$theme-colors-rgb` in `_maps.scss`: il sass di Metronic (`styles/sass/_init.scss`, sequenza di import 5.1) non compilava più e `next build` moriva con `SassError: Undefined variable`. *(v0.5.0: pin a `~5.1.3`, la versione per cui il tema è scritto. L'aggiornamento del design system è lavoro a sé.)*

## M0b · Pacchetti npm → `v0.5.1`

Track indipendente dalle app: i pacchetti `@nextcms/*` sono bloccati da una causa sola.

- [ ] 🔴 **NC-51** — `@nextcms/nextcms` dipende da versioni dei propri fratelli **mai pubblicate su npm**: chiede `@nextcms/generators@0.1.4` (pubblicate solo fino a 0.1.2) e `@nextcms/utils@0.1.10` (solo 0.1.0). `npm install` fallisce con `notarget`, quindi il pacchetto pubblicato `@nextcms/nextcms@0.1.19` **non è installabile da nessuno** e i suoi test non possono girare. Le strade: pubblicare le versioni mancanti, oppure risolvere i fratelli in locale con i workspace npm (vedi NC-38).
- [ ] 🟡 **NC-48** — `packages/core/nextcms` dichiarava `"test:unit": "jest --verbose"` senza avere jest tra le devDependencies. *(v0.5.0: jest `^29.7.0` e config `jest` aggiunti al package.json — non verificabile finché NC-51 blocca l'install.)*

## M1 · Sicurezza → `v0.6.0`

- [ ] 🔴 **NC-1** — `GET /api/user` e `GET /api/user/[id]` ritornano il record utente completo, **hash password incluso** (`userRepo.getAll/getById` fanno `findMany`/`findUnique` senza `select`). Anche `POST /api/auth/register` risponde `201` con l'oggetto utente intero. Introdurre una proiezione pubblica dell'utente e usarla ovunque.
- [ ] 🔴 **NC-2** — JWT firmato con segreto **hardcodato** `'shhhhh'` in `cms/lib/helpers/user-repo.ts`. Spostare su `process.env.JWT_SECRET` (fail-fast se assente).
- [ ] 🔴 **NC-3** — Il JWT ha come payload **l'intero record utente, hash password compreso**, ed è senza `expiresIn`. Firmare solo `{ id, username, isAdmin, isStaff }` con scadenza.
- [ ] 🔴 **NC-4** — `cms/next.config.js` fa `console.log("process ", process.env)` e `console.log("DATABASE_URL ", ...)`: dump di tutte le variabili d'ambiente (credenziali DB incluse) nei log di build e di runtime. Rimuovere.
- [ ] 🔴 **NC-5** — Credenziale Postgres Heroku reale committata in `cms/.env.example`. Ruotare la password sul provider, bonificare il file (e valutare la riscrittura della history).
- [ ] 🔴 **NC-6** — Nessuna route è protetta: `_middleware.ts` (cms e admin) fa solo `NextResponse.next()` e nessun handler verifica la sessione. Le API di scrittura (`user`, `page`, `components`, `role`) sono pubbliche.
- [ ] 🟠 **NC-7** — `console.log("req ", req, "res ", res)` in `api/page/index.ts`, `api/auth/login.ts`, `api/auth/register.ts`, `api/user/[id].ts`: logga header e cookie, quindi i token, in chiaro.
- [ ] 🟠 **NC-8** — `POST /api/user` e `POST /api/auth/register` sono aperti e senza validazione né rate limit: registrazione utenti non controllata.
- [ ] 🟠 **NC-9** — `cms/prisma/dev.db` (SQLite, 45 KB) è tracciato in git mentre il provider è `postgresql`. Rimuovere dal tracking e aggiungere a `.gitignore`.
- [ ] 🟠 **NC-10** — Dipendenze su versioni con vulnerabilità note: `next@12.1.1`, `jsonwebtoken@8.5.1`, `axios@0.21.1`, `react-scripts@4.0.3` (devDep). Aggiornare quelle che non sono migrazioni (Next è a sé, vedi NC-33).

## M2 · API corrette → `v0.7.0`

- [ ] 🔴 **NC-11** — **Login rotto end-to-end**: `userRepo.login` ritorna una stringa (il token), l'handler la incarta in `successResponse(user, ...)` → `{data: "<jwt>"}`, mentre `pages/login.tsx` si aspetta `data.data.access_token` e `refresh_token`. Il login va sempre nel ramo `catch`.
- [ ] 🟠 **NC-12** — `lib/crud/AuthCRUD.ts` invia un `FormData` forzando `Content-Type: application/x-www-form-urlencoded`: il body parser di Next non popola `req.body.username/password`.
- [ ] 🟠 **NC-13** — Credenziali errate: `userRepo.login` fa `throw`, l'handler non ha try/catch → 500 generico. Il ramo `errorResponse` in `api/auth/login.ts` è codice morto.
- [ ] 🟠 **NC-14** — Handler che **non rispondono mai** (richiesta appesa fino al timeout): `POST /api/auth/logout` (funzione vuota), gli stub `handleDELETE` di `page/[id]`, `user/[id]`, `role/[id]`, e il ramo `catch` di `api/role/index.ts`.
- [ ] 🟠 **NC-15** — Le route dinamiche leggono `req.body.id` invece di `req.query.id` su GET/DELETE: `parseInt(undefined)` → `NaN` → errore Prisma. Riguarda `page/[id]`, `user/[id]`, `components/[id]`, `role/[id]`.
- [ ] 🟡 **NC-16** — Metodo non supportato: le route `[id]` fanno `throw new Error(...)` → 500, mentre le route `index` rispondono 405. Uniformare su 405.
- [ ] 🟠 **NC-17** — `POST /api/page` e `POST /api/components` hanno la create commentata e rispondono `200 {}`: fingono successo senza scrivere nulla.
- [ ] 🔴 **NC-18** — `pages/[...index].tsx`: `getServerSideProps` ritorna `props: { basePages }` ma il componente destruttura `{ data }` → sempre `undefined`, la pagina renderizza vuoto. In più usa `context.req.url` (path + querystring) come slug invece dei segmenti di route.
- [ ] 🟠 **NC-19** — `pages/index.tsx` chiama `pagesRepo.getBySlug("/")`, poi **ignora** il risultato e renderizza un array di componenti hardcoded (`navbar`/`hero`/`features`).
- [ ] 🟡 **NC-20** — `api/auth/register.ts` passa `req.body.username` anche come `email`: email = username, e `email` è `@unique`.
- [x] 🟡 **NC-21** — `componentRepo.create` salvava `property: bodyComponent.toString()` → la stringa `"[object Object]"`. *(v0.5.0: chiuso in anticipo, era la stessa riga toccata da NC-25; ora usa `JSON.stringify` come l'`update`.)*
- [ ] 🟡 **NC-22** — Repo layer incompleto: `pagesRepo.update` e `userRepo.update` non ritornano nulla (e `userRepo.update` non aggiorna), `roleRepo` non ha `update`/`delete`.
- [ ] 🟡 **NC-23** — `api/role/index.ts` bypassa il repo layer e usa `prisma` direttamente: unica route che rompe la regola architetturale.

## M3 · Auth funzionante → `v0.8.0`

- [ ] **NC-39** — Auth e user management completi: login, logout, register, forgot password.
- [ ] **NC-40** — Profilo utente: lettura, update, creazione.

## M4 · Contenuti e page builder → `v0.9.0`

- [ ] 🟡 **NC-34** — `DynamicComponents` fa `import(\`${item.path}\`)` con path proveniente dal DB: webpack genera un context bundle enorme e il modulo caricato è deciso dai dati. Passare a una allow-list/registry di componenti.
- [ ] 🟡 **NC-35** — Pagine duplicate: `cms/pages/pagebuilder.tsx` e `cms/pages/page-builder.tsx`. Tenerne una.
- [ ] **NC-41** — Content management: post, pagine, categorie, tag.
- [ ] **NC-42** — Page builder: blocchi, immagini, persistenza del layout.

## M5 · Admin → `v0.10.0`

- [ ] ⚪ **NC-36** — `admin/package.json` duplica ~70 devDependencies di `cms/` (inclusi `react-scripts`, `react-router-dom`, residui CRA) per 3 pagine. Sfoltire.
- [ ] **NC-43** — Admin UI/UX: integrazione di tutte le entità.
- [ ] **NC-44** — Admin API: CRUD completo per ogni entità.

## M6 · Strada per 1.0 → `v1.0.0`

- [ ] 🟡 **NC-27** — `Dockerfile` e `Dockerfile-slim` di root non buildano nulla (la root non ha `next` né script). `Dockerfile-slim` inoltre copia `.next/standalone` (manca `output: 'standalone'` in `next.config.js`) e un `.npmrc` che non esiste.
- [ ] 🟡 **NC-28** — `BASE_URI` è hardcodato su un URL Vercel in `cms/lib/utils/constants.ts`, con la lettura da env commentata.
- [ ] 🟡 **NC-31** — Zero test per `cms/` e `admin/`. Serve almeno una copertura sui repo layer e sugli handler API, più il ritorno dell'E2E rimosso con NC-30.
- [ ] ⚪ **NC-32** — 64 chiamate `console.*` in `cms/`: sostituire con un logger con livelli.
- [ ] 🟡 **NC-33** — Migrazione a Next 13+/App Router (oggi: Next 12.1.1, React 17, `pages/`, `_middleware.ts` legacy). Migrazione, non bump.
- [ ] 🟡 **NC-37** — Lockfile doppi e file orfani. Root: `package-lock.json` + `yarn.lock` per una sola dipendenza, `.eslintrc.json` non risolvibile da nessuna app, `haikus.json` (fixture Octocat) fuori contesto. `admin/`: convivono `package-lock.json` e `yarn.lock`, e qualcosa nell'ambiente riscrive il secondo dopo un `npm ci` — con due lockfile in disaccordo l'install non è deterministico. Il package manager dichiarato è npm: rimuovere gli `yarn.lock`.
- [ ] ⚪ **NC-38** — Valutare i workspace npm per evitare l'install cartella-per-cartella.
