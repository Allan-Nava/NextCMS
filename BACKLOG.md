# BACKLOG — NextCMS

Sorgente unica dei todo del progetto. Ogni item ha un **id stabile `NC-n`**: gli id non si riusano e non si rinumerano. Si spunta `[x]` quando la cosa è fatta *e* rilasciata (tag + riga nel `CHANGELOG.md`).

Stato iniziale popolato dall'**audit del 2026-07-25** sul commit `7ac0299`.

Legenda severità: 🔴 critico · 🟠 alto · 🟡 medio · ⚪ debito.

---

## M1 · Sicurezza

- [ ] 🔴 **NC-1** — `GET /api/user` e `GET /api/user/[id]` ritornano il record utente completo, **hash password incluso** (`userRepo.getAll/getById` fanno `findMany`/`findUnique` senza `select`). Anche `POST /api/auth/register` risponde `201` con l'oggetto utente intero. Introdurre una proiezione pubblica dell'utente e usarla ovunque.
- [ ] 🔴 **NC-2** — JWT firmato con segreto **hardcodato** `'shhhhh'` in `cms/lib/helpers/user-repo.ts`. Spostare su `process.env.JWT_SECRET` (fail-fast se assente).
- [ ] 🔴 **NC-3** — Il JWT ha come payload **l'intero record utente, hash password compreso**, ed è senza `expiresIn`. Firmare solo `{ id, username, isAdmin, isStaff }` con scadenza.
- [ ] 🔴 **NC-4** — `cms/next.config.js` fa `console.log("process ", process.env)` e `console.log("DATABASE_URL ", ...)`: dump di tutte le variabili d'ambiente (credenziali DB incluse) nei log di build e di runtime. Rimuovere.
- [ ] 🔴 **NC-5** — Credenziale Postgres Heroku reale committata in `cms/.env.example`. Ruotare la password sul provider, bonificare il file (e valutare la riscrittura della history).
- [ ] 🔴 **NC-6** — Nessuna route è protetta: `_middleware.ts` (cms e admin) fa solo `NextResponse.next()` e nessun handler verifica la sessione. Le API di scrittura (`user`, `page`, `components`, `role`) sono pubbliche.
- [ ] 🟠 **NC-7** — `console.log("req ", req, "res ", res)` in `api/page/index.ts`, `api/auth/login.ts`, `api/auth/register.ts`, `api/user/[id].ts`: logga header e cookie, quindi i token, in chiaro.
- [ ] 🟠 **NC-8** — `POST /api/user` e `POST /api/auth/register` sono aperti e senza validazione né rate limit: registrazione utenti non controllata.
- [ ] 🟠 **NC-9** — `cms/prisma/dev.db` (SQLite, 45 KB) è tracciato in git mentre il provider è `postgresql`. Rimuovere dal tracking e aggiungere a `.gitignore`.
- [ ] 🟠 **NC-10** — Dipendenze su versioni con vulnerabilità note: `next@12.1.1`, `jsonwebtoken@8.5.1`, `axios@0.21.1`, `react-scripts@4.0.3` (devDep). Pianificare l'aggiornamento (Next è una migrazione a sé, vedi NC-33).

## M2 · Bug funzionali API e rendering

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
- [ ] 🟡 **NC-21** — `componentRepo.create` salva `property: bodyComponent.toString()` → la stringa `"[object Object]"`. L'`update` usa correttamente `JSON.stringify`.
- [ ] 🟡 **NC-22** — Repo layer incompleto: `pagesRepo.update` e `userRepo.update` non ritornano nulla (e `userRepo.update` non aggiorna), `roleRepo` non ha `update`/`delete`.
- [ ] 🟡 **NC-23** — `api/role/index.ts` bypassa il repo layer e usa `prisma` direttamente: unica route che rompe la regola architetturale.

## M3 · Schema dati e build

- [ ] 🔴 **NC-24** — `cms/prisma/schema.prisma`: `Visit` dichiara `Page Page? @relation(fields: [id], references: [id])` senza il campo opposto su `Page` → **`prisma generate` fallisce** (P1012). In più usa la primary key come foreign key: la relazione va ridisegnata (`pageId` + `Page.visits Visit[]`).
- [ ] 🟠 **NC-25** — Campi obbligatori mancanti nelle create → errori di tipo in `next build`: `Page.type` in `pagesRepo.create` e in `prisma/seed.ts`; `Component.template` e `Component.data` in `componentRepo.create`.
- [ ] 🟠 **NC-26** — `cms/` non ha **nessun lockfile**: install non riproducibile in locale, in Docker e in CI.
- [ ] 🟡 **NC-27** — `Dockerfile` e `Dockerfile-slim` di root non buildano nulla (la root non ha `next` né script). `Dockerfile-slim` inoltre copia `.next/standalone` (manca `output: 'standalone'` in `next.config.js`) e un `.npmrc` che non esiste.
- [ ] 🟡 **NC-28** — `BASE_URI` è hardcodato su un URL Vercel in `cms/lib/utils/constants.ts`, con la lettura da env commentata.

## M4 · CI e qualità

- [ ] 🟠 **NC-29** — Nessun gate di build in CI: non gira né `tsc --noEmit` né `next lint` né `next build`. Solo CodeQL, un job Cypress e la publish Docker.
- [ ] 🟡 **NC-30** — `.github/workflows/cypress.yml` gira a ogni push ma nel repo non esistono test Cypress né la config: builda e avvia `cms/` a vuoto.
- [ ] 🟡 **NC-31** — Zero test per `cms/` e `admin/` (jest esiste solo in `packages/core/nextcms`, 2 test). Serve almeno una copertura sui repo layer e sugli handler API.
- [ ] ⚪ **NC-32** — 64 chiamate `console.*` in `cms/`: sostituire con un logger con livelli.

## M5 · Debito e pulizia

- [ ] 🟡 **NC-33** — Valutare la migrazione a Next 13+/App Router (oggi: Next 12.1.1, React 17, `pages/`, `_middleware.ts` legacy). Migrazione, non bump.
- [ ] 🟡 **NC-34** — `DynamicComponents` fa `import(\`${item.path}\`)` con path proveniente dal DB: webpack genera un context bundle enorme e il modulo caricato è deciso dai dati. Passare a una allow-list/registry di componenti.
- [ ] 🟡 **NC-35** — Pagine duplicate: `cms/pages/pagebuilder.tsx` e `cms/pages/page-builder.tsx`. Tenerne una.
- [ ] ⚪ **NC-36** — `admin/package.json` duplica ~70 devDependencies di `cms/` (inclusi `react-scripts`, `react-router-dom`, residui CRA) per 3 pagine. Sfoltire.
- [ ] ⚪ **NC-37** — Root: due lockfile (`package-lock.json` + `yarn.lock`) per una sola dipendenza, e `haikus.json` (fixture Octocat) fuori contesto. Ripulire.
- [ ] ⚪ **NC-38** — Valutare i workspace npm per evitare l'install cartella-per-cartella.

## M6 · Feature (da TODO.md)

- [ ] **NC-39** — Auth e user management completi: login, logout, register, forgot password.
- [ ] **NC-40** — Profilo utente: lettura, update, creazione.
- [ ] **NC-41** — Content management: post, pagine, categorie, tag.
- [ ] **NC-42** — Page builder: blocchi, immagini, persistenza del layout.
- [ ] **NC-43** — Admin UI/UX: integrazione di tutte le entità.
- [ ] **NC-44** — Admin API: CRUD completo per ogni entità.
