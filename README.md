# Aleman

Web app per aprendre alemany amb lliçons diàries (text + àudio) adaptades al teu nivell CEFR. Pensada per fer servir des del mòbil com a PWA.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** (Auth, Postgres amb RLS, Storage per als MP3)
- **Claude Sonnet 4.5** per generar el text alemany + traducció + preguntes
- **OpenAI TTS** (`tts-1`, veu `onyx`) per a l'àudio
- **Vercel Cron** per generar les lliçons cada nit

## Configuració

### 1. Crear projecte a Supabase

1. Obre [supabase.com](https://supabase.com) i crea un projecte nou.
2. A *Project Settings → API* copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (mai exposar al client)
3. Vés a *SQL Editor* i executa el contingut de [`supabase/schema.sql`](supabase/schema.sql) i després les migracions de [`supabase/migrations/`](supabase/migrations/) per ordre.
4. A *Authentication → Providers* deixa Email actiu i, si vols, desactiva la confirmació per email mentre desenvolupes.

### 2. Claus d'API

- **Claude**: [console.anthropic.com](https://console.anthropic.com) → `ANTHROPIC_API_KEY`
- **OpenAI**: [platform.openai.com](https://platform.openai.com) → `OPENAI_API_KEY`

### 3. Variables d'entorn

```bash
cp .env.local.example .env.local
# omple els valors
```

`CRON_SECRET` ha de ser una cadena aleatòria (qualsevol UUID o `openssl rand -hex 32`).

### 4. Desenvolupament local

```bash
npm install
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000).

### 5. Deploy

#### Opció A — GitHub Pages (només la `/demo`)

Hi ha un workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) que:
1. Esborra les rutes que necessiten servidor (api, auth, today, etc.)
2. Construeix amb `EXPORT=1` (output: `export`) i `basePath=/aleman`
3. Publica `out/` a GitHub Pages

Per activar-ho:
1. Vés a *Settings → Pages* del repo
2. **Source**: GitHub Actions
3. Empeny a `main` o executa el workflow manualment des de la pestanya *Actions*

L'app quedarà a `https://<usuari>.github.io/aleman/demo/`. El test, login, today, etc. **no funcionen** en aquest mode (és només una demo estàtica).

#### Opció B — Vercel (app sencera)

```bash
vercel
```

A *Project Settings → Environment Variables* afegeix totes les variables (incloent `CRON_SECRET`). El [`vercel.json`](vercel.json) ja conté la cron diària a les 04:00 UTC; Vercel hi passa automàticament la capçalera `Authorization: Bearer ${CRON_SECRET}`.

## Flux d'usuari

1. **Registre** → `/signup`
2. **Test de nivell** (12 preguntes ponderades, A1 → C2) → `/test`
3. **Lliçó d'avui** → `/today`
   - Si encara no existeix, l'usuari clica "Generar" (~15 s)
   - Reproductor d'àudio (MP3 signat 1h, **cau offline via service worker**)
   - Text alemany + traducció ocultable
   - Vocabulari clau (8 paraules → afegides automàticament a les targetes SR)
   - 3 preguntes de comprensió amb correcció
4. **Repàs SM-2** → `/review`
   - Mostra targetes amb venciment ≤ avui
   - 4 botons (Una altra vegada / Difícil / Bé / Fàcil) recalculen ease & interval
5. **Preferències** → `/preferences`
   - Tria 3-5 temes preferits → la cron les fa servir per generar el contingut
   - Permet refer el test de nivell
6. **Historial** → `/history`

La cron diària (`/api/cron/daily`) recorre tots els perfils amb nivell assignat i genera la lliçó si no existeix.

## Offline (PWA)

El service worker [`public/sw.js`](public/sw.js):
- Pre-cacheja l'app shell a la instal·lació
- **Audio MP3**: cache-first (un cop reproduït, queda disponible offline)
- Chunks de Next.js: stale-while-revalidate
- API: network-first amb fallback a cau
- Navegacions: network-first; si offline i sense cau, mostra `/offline`

El registre del SW només s'activa en producció. Per provar offline:
```bash
npm run build && npm start
# Obre l'app, navega per /today, torna les DevTools → Network → Offline
```

## Estructura

```
app/
  api/
    auth/signout/      Tancar sessió
    cron/daily/        Cron: genera lliçons per a tots els usuaris
    lessons/today/     Genera la lliçó del dia per a l'usuari actual
    lessons/[id]/audio Retorna URL signada del MP3
    review/            GET targetes pendents · POST review (SM-2)
  login/               Pantalla de login
  signup/              Pantalla de registre
  test/                Test inicial CEFR
  today/               Lliçó del dia
  history/             Historial de lliçons
  review/              Repàs amb spaced repetition
  preferences/         Preferències (temes + nivell)
  offline/             Pàgina fallback quan no hi ha connexió
components/
  Nav.tsx              Nav amb badge de targetes pendents
  RegisterSW.tsx       Registra el service worker
lib/
  supabase/            Clients (browser, server, admin)
  levelTest.ts         Banc de preguntes + càlcul de nivell
  generateLesson.ts    Crida a Claude + OpenAI TTS
  lessonService.ts     Generació compartida (cron + on-demand)
  topics.ts            Catàleg de temes + selecció ponderada
  sm2.ts               Algorisme SM-2 (SuperMemo 2)
public/
  sw.js                Service worker per offline
  manifest.webmanifest PWA manifest
  icon-{192,512}.png   Icones PWA
proxy.ts               Auth gating per a rutes protegides
supabase/
  schema.sql           Esquema base, RLS, triggers, bucket d'àudio
  migrations/          Migracions incrementals (0002 = vocab_cards)
vercel.json            Configuració de la cron
```

## Costos estimats (per usuari/dia)

- Claude Sonnet 4.5: ~$0.005 (text + preguntes ~2k tokens output)
- OpenAI TTS-1: ~$0.005 (300 paraules)
- Supabase Storage: ~$0.0001 (MP3 ~300 KB)

**Total: ~$0.01 per usuari/dia**, o ~$3/mes amb ús diari.

## Pròxims passos

- Velocitat d'àudio variable (0.75x / 1x / 1.25x / 1.5x)
- Mode "shadowing" amb gravació de l'usuari
- Notificacions push per recordar la lliçó diària
- Estadístiques (ratxa de dies, paraules apreses)
