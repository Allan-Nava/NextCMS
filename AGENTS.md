# AGENTS.md — NextCMS

**NextCMS**: CMS in Next.js 12 + TypeScript + Prisma (WIP, MIT). Tre parti indipendenti: `cms/` (app pubblica + API, porta 3000), `admin/` (pannello Metronic, porta 4000, `basePath /admin`), `packages/` (pacchetti npm `@nextcms/*`, CLI/framework in JS CommonJS).

Questo file definisce le regole operative per gli agent (Copilot, Claude, altri tool AI) quando lavorano in questo repository.

## Regole di lavoro (SEMPRE)

- **Ogni feature = un tag `vX.Y.Z`**: sezione in `CHANGELOG.md` (Keep a Changelog, italiano) + `git tag -a vX.Y.Z -m "Release X.Y.Z"`. `minor` per feature, `patch` per fix e doc.
- **Tracciare tutto**: ogni lavoro esiste come item `NC-n` in `BACKLOG.md` prima di iniziare, si spunta quando e' rilasciato, e il commit ne cita l'id (`NC-12: fix login response envelope`).
- **Documentare**: modifiche ad architettura, comandi, env, schema Prisma o contratto API aggiornano `CLAUDE.md` e `AGENTS.md` nello stesso commit.
- **Nessun workspace**: `npm install` e gli script si lanciano dentro `cms/`, `admin/` o il singolo package. Mai dalla root (nessuno script lì).
- **Gate prima di chiudere**: `npm run lint` + `npm run build` verdi nell'app toccata. `cms/`/`admin/` non hanno test: se aggiungi logica non banale in `lib/`, aggiungi anche il test (jest è già in `packages/core/nextcms`).
- **MAI `git push`**: lo fa sempre l'utente, tag inclusi. MAI `Co-Authored-By` nei commit.
- **Niente segreti** in codice, `.env.example`, doc o log. (`cms/.env.example` ne contiene uno reale: va bonificato, non replicato — `NC-5`.)
- **Todo -> `BACKLOG.md`** (id stabili `NC-n`), niente `TODO:` sparsi nei commenti.
- **Header di file**: replica il blocco `File / Project / Author / Copyright` presente in tutti i sorgenti.
- **Lingua = inglese** per codice, commenti e output user-facing.
- **Next 12 + React 17, `pages/` router**: non fare bump maggiori (Next 13+/App Router) senza chiederlo.

## Comandi

- `cd cms && npm run dev` (3000) - `npm run build` - `npm start` - `npm run lint`
- `cd admin && npm run dev` (4000)
- Prisma (da `cms/`): `npx prisma generate` - `npx prisma migrate dev` - `npx prisma db seed` - `npx prisma studio`
- Package: `cd packages/core/nextcms && npm run test:unit` - `npm publish --access public`

## Dove sta cosa

- Rendering dinamico: `cms/components/DynamicComponents.tsx` (import via `next/dynamic` sul `path` del componente, fallback `NoComponent`); pagine risolte per slug in `cms/pages/[...index].tsx`.
- API: `cms/pages/api/<entity>/{index,[id]}.ts`, `switch (req.method)` + `405` di default, zero logica DB inline.
- Accesso al DB: **solo** `cms/lib/helpers/*-repo.ts` (`pagesRepo`, `userRepo`, ...) via `cms/lib/prisma.ts`.
- Risposte API: `successResponse` / `errorResponse` da `cms/lib/types/response/response.ts`.
- Stato UI: Redux Toolkit in `cms/lib/reducers/` (`auth`, `layout`, `dragAndDrop`), page builder react-dnd in `cms/components/pagebuilder/`.
- Schema dati: `cms/prisma/schema.prisma` (`Page`, `Component`, `Entity`, `User`, `Role`, `Visit`), provider postgresql.

## Rotto oggi (audit 2026-07-25, dettagli in BACKLOG.md)

- Login non funzionante end-to-end (`NC-11`, `NC-12`); credenziali errate danno 500 generico (`NC-13`).
- Route `[id].ts` leggono `req.body.id` invece di `req.query.id` (`NC-15`); alcuni handler non rispondono mai (`NC-14`).
- `prisma generate` fallisce: relazione `Visit -> Page` senza campo opposto (`NC-24`); create senza campi obbligatori (`NC-25`).
- API espongono l'hash password (`NC-1`); JWT con segreto hardcodato e utente intero nel payload (`NC-2`, `NC-3`); `next.config.js` logga tutte le env (`NC-4`).
- `POST /api/page` e `POST /api/components` rispondono 200 senza scrivere (`NC-17`); `[...index].tsx` passa props con nome sbagliato e renderizza vuoto (`NC-18`).

## Trappole note

- `Dockerfile` e `Dockerfile-slim` di root non buildano nulla (la root non ha `next`): l'immagine reale la produce `docker-publish.yml` da `cms/Dockerfile`. `Dockerfile-slim` presuppone `output: 'standalone'` e `.npmrc`, entrambi assenti.
- La CI (`ci.yml`) e' un gate reale ed e' rossa di proposito finche' M0 non e' chiusa (`NC-24`, `NC-25`, `NC-48`): chiudere gli item, non silenziare i job.
- `cms/` non ha lockfile: `ci.yml` usa `npm install` senza cache finche' non arriva (`NC-26`).
- `_middleware.ts` (cms e admin) e' uno stub `NextResponse.next()`: nessuna route e' protetta a livello di middleware.
- `BASE_URI` in `cms/lib/utils/constants.ts` e' hardcodato su un URL Vercel (lettura da env commentata).
- Le API route fanno `console.log` della request intera: non aggiungerne, mai loggare credenziali o token.
- Hashing password (`bcryptjs`, cost 8) e JWT stanno nel repo layer (`userRepo`), non negli handler: non duplicarli.
- Dopo ogni modifica a `schema.prisma` serve `npx prisma generate`, altrimenti i tipi `Prisma.*Input` non combaciano.
- I package `@nextcms/*` dichiarano `engines: node >=12.22.0 <=17.x.x`.
- Due lockfile in root (`package-lock.json` + `yarn.lock`) per una dipendenza: nelle app si usa **npm**.

## Roadmap

Sei milestone sequenziali in `BACKLOG.md`: **M0** build verde (`v0.5.0`) -> **M1** sicurezza (`v0.6.0`) -> **M2** API corrette (`v0.7.0`) -> **M3** auth (`v0.8.0`) -> **M4** contenuti e page builder (`v0.9.0`) -> **M5** admin (`v0.10.0`) -> **M6** strada per 1.0 (`v1.0.0`). Non si aprono item di una milestone successiva finche' la precedente non e' chiusa.

## Puntatori

- Todo: `BACKLOG.md` (id `NC-n`) - Rilasci: `CHANGELOG.md` - Doc: `docs/` - CI: `.github/workflows/` (`ci.yml`, `codeql.yml`, `docker-publish.yml`) - Env: `.env.example`, `cms/.env.example` (`DATABASE_URL`, `ADMIN_URL`, `API_URI`, `BASE_URI`)
