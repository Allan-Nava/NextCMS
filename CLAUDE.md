# CLAUDE.md — NextCMS

**NextCMS** (`github.com/Allan-Nava/NextCMS`, MIT): CMS headless-ish in **Next.js 12 + TypeScript + Prisma**, ancora **WIP**. Non è un monorepo con workspaces: è un repo che contiene tre cose indipendenti — l'app pubblica `cms/`, il pannello `admin/` (multi-zone Next), e i pacchetti npm `@nextcms/*` in `packages/` (CLI/framework in JS CommonJS, ispirato a Strapi). Filosofia: le pagine sono **dati** (tabella `Page` + `Component`), il rendering è dinamico via `next/dynamic`, non un albero di componenti hardcoded.

## Regole di lavoro (SEMPRE)

- **Ogni feature = una release taggata `vX.Y.Z`**: nuova sezione in `CHANGELOG.md` (Keep a Changelog, in italiano) + `git tag -a vX.Y.Z -m "Release X.Y.Z"`. Bump `minor` per feature e cambi di comportamento, `patch` per fix e doc. Senza chiederlo.
- **Tracciare tutto, sempre**: nessun lavoro non tracciato. Ogni cosa che si fa esiste come item `NC-n` in `BACKLOG.md` **prima** di iniziare (se manca, si crea), si spunta `[x]` quando è rilasciata, e finisce nel `CHANGELOG.md` con il tag. Ogni item chiuso cita nel commit il suo id (`NC-12: fix login response envelope`).
- **Documentare quello che si cambia**: se una modifica tocca architettura, comandi, env, schema Prisma o contratto API, aggiorna `CLAUDE.md` e `AGENTS.md` nello stesso commit. Doc disallineata = lavoro non finito.
- **Ogni cartella è un progetto a sé**: `cms/`, `admin/`, e ogni package sotto `packages/` hanno il proprio `package.json` e lockfile. `npm install` e gli script si lanciano **dentro** la cartella, mai dalla root (il `package.json` di root ha solo `@types/bcryptjs` e nessuno script).
- **Gate prima di chiudere**: nell'app toccata `npm run lint` + `npm run build` verdi. Non esiste una suite di test per `cms/`/`admin/` — se aggiungi logica non banale in `lib/helpers/*` o `lib/utils/*`, aggiungi il test insieme (jest è già usato in `packages/core/nextcms`).
- **MAI `git push`** — lo fa sempre l'utente (tag inclusi: `git push --follow-tags` lo lancia lui). MAI `Co-Authored-By` nei commit.
- **Niente segreti** in codice, `.env.example`, doc o log. Le credenziali stanno solo in `.env` (gitignored). ⚠️ `cms/.env.example` contiene oggi una connection string Heroku reale: va bonificata, non replicata (`NC-5`).
- **Todo → `BACKLOG.md`** (sorgente unica, id stabili `NC-n`, mai riusati né rinumerati). Non sparpagliare `TODO:` nei commenti; `TODO.md` è solo un puntatore.
- **Header in ogni file nuovo**: il blocco di commento `File / Project / File Created / Author / Copyright` presente in tutti i sorgenti è convenzione del progetto — replicalo.
- **Lingua = inglese**: codice, commenti, identificatori e output user-facing (messaggi API, label UI) in inglese.
- **Non aggiornare Next/React di maggiore senza chiederlo**: siamo su **Next 12 + React 17** con `pages/` router e `_middleware.ts` (API legacy). Un salto a Next 13+/App Router è una migrazione, non un bump.

## Comandi

```bash
# app pubblica (porta 3000)
cd cms && npm install && npm run dev
npm run build && npm start
npm run lint

# pannello admin (porta 4000, servito sotto /admin)
cd admin && npm install && npm run dev

# database (schema e client vivono in cms/)
cd cms
npx prisma generate            # rigenera il client dopo ogni modifica allo schema
npx prisma migrate dev         # crea/applica una migration
npx prisma db seed             # ts-node prisma/seed.ts
npx prisma studio

# pacchetti npm
cd packages/core/nextcms && npm run test:unit
npm publish --access public    # pubblicazione @nextcms/* (vedi docs/NPM.md)
```

## Architettura

- **`cms/`** (`next-cms`) — l'app pubblica e l'API. Porta 3000.
  - `pages/[...index].tsx` — catch-all: `getServerSideProps` risolve lo slug con `pagesRepo.getBySlug(context.req.url)` e passa i dati a `DynamicComponents`.
  - `components/DynamicComponents.tsx` — cuore del rendering: per ogni `PageComponent` fa `dynamic(() => import(item.path))` con fallback su `NoComponent`, e ricorre sui figli quando `supportNestedComponent`. I componenti renderizzabili stanno in `components/Elements/` (`Hero`, `Navbar`, `Features`, `Layout1`).
  - `pages/api/<entity>/{index,[id]}.ts` — un handler per entità (`page`, `components`, `user`, `role`, `auth`): `switch (req.method)` con `405` di default, nessuna logica DB inline.
  - `lib/helpers/*-repo.ts` — **unico punto che parla con Prisma** (`pagesRepo`, `userRepo`, `componentRepo`, `roleRepo`, `entityRepo`). Le API route delegano qui.
  - `lib/types/response/response.ts` — envelope uniforme: `successResponse(data, message)` / `errorResponse(error)` con `DEFAULTResponse.OK|KO`.
  - `lib/reducers/` — Redux Toolkit (`auth`, `layout`, `dragAndDrop`) montati in `store.ts`; il page builder (`components/pagebuilder/`, react-dnd) ci si appoggia.
  - `lib/prisma.ts` — singleton del `PrismaClient`.
- **`admin/`** (`next-admin`) — pannello su tema Metronic (`src/_metronic`), `basePath: '/admin'`, porta 4000. **Non ha Prisma**: parla con l'API di `cms/` via `lib/helpers/fetchWrapper.ts`. È il pezzo più indietro (solo `_app`, `index`, `_middleware`).
- **`packages/`** — pacchetti npm pubblicati, JS CommonJS, indipendenti dalle due app Next:
  - `core/nextcms` → `@nextcms/nextcms`: CLI `nextcms` (commander) + bootstrap/loader stile Strapi, stack Koa.
  - `core/utils` → `@nextcms/utils`: env helper, errors, sanitize/visitors (incl. `remove-password`).
  - `generators/app` → `@nextcms/generate-new`, `generators/generators` → `@nextcms/generators` (plop).
  - `cli/create-nextcms-app`: scaffolder `npx create-nextcms-app`.
- **Dati** — `cms/prisma/schema.prisma`: `Page`, `Component` (albero via `parent` + `template` + `data`), `Entity`, `User`, `Role`, `Visit`. Provider **postgresql** via `DATABASE_URL` (la variante sqlite è commentata nello schema).

## Trappole note / regole tecniche

- **Il `Dockerfile` e il `Dockerfile-slim` di root non buildano l'app** (`NC-27`): la root non ha né `next` né script. La pipeline reale è `.github/workflows/docker-publish.yml` con context `./cms` e `cms/Dockerfile` → push su `ghcr.io`. `Dockerfile-slim` inoltre copia `.next/standalone` e `.npmrc`, ma `cms/next.config.js` non imposta `output: 'standalone'` e `.npmrc` non esiste: va sistemato prima di usarlo, non copiato altrove. Il `cms/Dockerfile` invece è stato riscritto ed è quello buono.
- **`bootstrap` è pinnato a `~5.1.3` di proposito** (`NC-52`): il tema Metronic in `styles/sass/_init.scss` usa la sequenza di import di Bootstrap 5.1, e da 5.3 `$theme-colors-rgb` vive in `_maps.scss` — sbloccare il pin fa fallire il build con `SassError: Undefined variable`.
- **`@popperjs/core` e la coppia apexcharts sono allineati** per far risolvere npm (`NC-50`): non riportarli alle versioni vecchie.
- **I lockfile vanno rigenerati da zero**, non "aggiornati": quello di `admin` era lockfileVersion 2 e ometteva i binari SWC opzionali, e rigenerarlo con `node_modules` già popolato eredita l'omissione. Se manca `@next/swc-*`, `rm -rf node_modules package-lock.json` e reinstalla.
- **I pacchetti `packages/@nextcms/*` non sono installabili** (`NC-51`): dipendono da versioni dei propri fratelli mai pubblicate su npm. Per questo `ci.yml` non ha un job `packages`.
- **`_middleware.ts` (cms e admin) è uno stub** che fa solo `NextResponse.next()`: l'auth non è ancora applicata a livello di middleware. Non dare per scontato che una route sia protetta.
- **`BASE_URI` in `cms/lib/utils/constants.ts` è hardcodato** su un URL Vercel, con la lettura da env commentata. Se tocchi quel file, passa da `process.env`.
- **`console.log` di request/response nelle API route**: loggano `req` intero (header inclusi). Non aggiungerne altri e non loggare mai credenziali o token.
- **Le password si hashano con `bcryptjs` (`hashSync`, cost 8) in `userRepo`**, i token con `jsonwebtoken`: l'hashing sta nel repo layer, non nell'handler. Non duplicarlo altrove.
- Dopo ogni modifica a `schema.prisma` serve `npx prisma generate`, altrimenti i tipi `Prisma.*Input` usati nei repo non combaciano.
- I package `@nextcms/*` dichiarano `engines: node >=12.22.0 <=17.x.x`: su Node moderno alcuni di essi possono non installarsi: non è un bug delle app Next.
- Ci sono **due lockfile in root** (`package-lock.json` e `yarn.lock`) per una singola dipendenza: non prenderli come indicazione del package manager: nelle app si usa **npm**.

## Roadmap

`BACKLOG.md` definisce milestone **sequenziali**, ognuna con la sua release: **M0** build verde ✅ (`v0.5.0`) → **M1** sicurezza (`v0.6.0`) → **M2** API corrette (`v0.7.0`) → **M3** auth (`v0.8.0`) → **M4** contenuti e page builder (`v0.9.0`) → **M5** admin (`v0.10.0`) → **M6** strada per 1.0 (`v1.0.0`). A parte, **M0b** (`v0.5.1`) per i pacchetti npm. Non si aprono item di una milestone successiva finché la precedente non è chiusa (tutti gli item spuntati, CI verde, sezione nel changelog, tag).

## Stato noto

Il repo è WIP. L'audit sul commit `7ac0299` ha aperto 52 item in `BACKLOG.md`; M0 ne ha chiusi 11. **Il progetto compila** — `cms` e `admin` passano install, typecheck, lint e build — ma il comportamento a runtime è ancora largamente rotto. Prima di toccare qualcosa:

- Il **login non funziona end-to-end** (`NC-11`/`NC-12`): il token torna come stringa dentro `successResponse`, il client si aspetta `access_token`/`refresh_token`.
- Le route `[id].ts` leggono `req.body.id` invece di `req.query.id` (`NC-15`) e diversi handler non rispondono mai (`NC-14`).
- `POST /api/page` e `POST /api/components` rispondono 200 senza scrivere (`NC-17`); `[...index].tsx` passa le props con il nome sbagliato e renderizza vuoto (`NC-18`).
- Le API espongono l'hash password e il JWT è firmato con un segreto hardcodato che contiene l'intero utente (`NC-1`…`NC-3`); `next.config.js` logga tutte le env (`NC-4`).

Che compili non vuol dire che funzioni: verifica sull'item di backlog corrispondente.

## Puntatori

- Todo: `BACKLOG.md` (id `NC-n`) · Rilasci: `CHANGELOG.md` · Doc: `docs/` (`Prisma.md`, `NPM.md`) · Schema: `cms/prisma/schema.prisma`
- CI: `.github/workflows/` — `ci.yml` (gate: typecheck/lint/build), `codeql.yml`, `docker-publish.yml` (tag `v*` → immagine su ghcr.io)
- Env: `.env.example` (root, Prisma) e `cms/.env.example` — variabili usate: `DATABASE_URL`, `ADMIN_URL`, `API_URI`, `BASE_URI`
- Dev container: `.devcontainer/` · Debug: `.vscode/launch.json`
