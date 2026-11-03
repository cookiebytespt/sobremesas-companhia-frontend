# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                 # localhost:3000 (Turbopack)
pnpm build               # production build — also runs the TypeScript check
pnpm lint                # eslint .
pnpm typecheck           # tsc --noEmit
```

Node 24 (`nvm use`), **pnpm**. Local setup: `cp .env.example .env.local`, run the API (`../backend`: `swift run App serve`)
on `http://localhost:8080`, then `pnpm dev`. Without the API the public pages render; the backoffice returns
`upstream.unreachable`. To sign in locally, leave the API without `RESEND_API_KEY`: the code is printed in its log.

## What this is

**Next.js 16 App Router** (TypeScript, Tailwind CSS 4) — the Sobremesas & Companhia **platform** at
`dev.sobremesasecompanhia.pt`, and **the business's website** — it replaces the static landing (`../landing`, GitHub
Pages at `sobremesasecompanhia.pt`, retired once the domain moves here; rev. 4 of the plan): home page, public order
form, contact, privacy, and the backoffice `/backoffice`. Nothing on the public side links to the old site. Clients have
no accounts — they are reached by e-mail, or by phone/WhatsApp when they leave only a number; only staff sign in. All data comes from the
**Vapor API** in `../backend` (see its `CLAUDE.md` and `Public/openapi.yaml`); this app has no database. Design document:
`../docs/PLATFORM-PLAN.md`. Plumbing is derived from `CookieBytes/Brindigrafica/frontend`; the look from `../landing`.

## Architecture

### Data flow — BFF pattern

```
Browser ──► /api/backend/<path>  (src/app/api/backend/[...path]/route.ts) ──► {BACKEND_URL}/api/v1/<path>
             • adds Authorization: Bearer <access token> from the httpOnly cookie `sc_at` (or `x-sc-access`, see proxy)
             • for visitors: mints the guest form-session token on the first POST /uploads|/orders,
               keeps it in the httpOnly cookie `sc_upload` (24 h) and sends it as X-Upload-Token
Browser ──► /api/auth/{google,email/start,email/verify,logout}  (src/app/api/auth/**): sign-in flow → session cookies
src/proxy.ts (middleware) ──► refreshes an expired access token from `sc_rt` before /backoffice/** and /api/backend/** run
Server Components ──► lib/backoffice/session.ts (getBackofficeSession → GET /auth/me) for the admin guard
```

- `src/lib/api/types.ts` — TypeScript mirrors of the API DTOs. **Keep in sync with `backend/Sources/App/DTOs`.**
- `src/lib/api/client.ts` — browser client (`api.auth.*` for sign-in/profile/sessions, `api.uploads.upload()`), always
  through the proxy or the `/api/auth` handlers.
- `src/lib/api/backoffice.ts` + `src/lib/backoffice/queries.ts` — typed `/admin/*` calls and TanStack Query hooks/keys.
- `src/lib/api/errors.ts` — `ApiError {status, code, reason}` and `apiErrorMessage(err)` in the page's language.
- **Everything in a URL is English** — route segments (`/request`, `/backoffice/team`, `/backoffice/login`), query params
  (`?state=`, `?view=`, `?occasion=`) and their values — in every language. Only the text people read is translated
  (public pages pt/en/es/fr, backoffice pt).

### Languages (pt / en / es / fr) — same approach as the landing

- Portuguese is unprefixed (`/pedido`); the others are route segments (`/en/pedido`). `src/app/(site)/(pt)/**` and
  `src/app/(site)/[lang]/**` are thin wrappers around shared page components in `src/components/site/pages/`.
- Text: `src/i18n/dictionaries/{pt,en,es,fr}.ts` — `pt.ts` is the reference and defines `Dictionary`, so a missing key fails
  the build. `getDictionary(locale)`, `fmt()` for placeholders. Helpers in `src/lib/locale.ts`: `localizedPath`,
  `splitLocale`, `documentLocale` (from `<html lang>`).
- The browser client sends `Accept-Language` from `<html lang>`, so API error messages come back in the page's language.
- Backoffice is **pt-PT only** (`src/app/(backoffice)/layout.tsx`), formatting via `src/lib/labels.ts`.

### Auth (no Auth0, no passwords)

Only staff sign in, at **`/backoffice/login`** (`src/app/(backoffice)/backoffice/login/page.tsx` +
`components/backoffice/LoginForm.tsx`): a Google Identity Services button (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`; the GIS script
is loaded on demand and the credential posted to `/api/auth/google`) and an e-mail code fallback (`/api/auth/email/start`
→ 6-digit code → `/api/auth/email/verify`). Both handlers (`src/lib/auth/handlers.ts`) call the API (`src/lib/auth/server.ts`)
and store the API's tokens in two httpOnly cookies (`src/lib/auth/cookies.ts`): `sc_at` (access JWT, ~15 min) and `sc_rt`
(rotating refresh token, 30 days). The browser only ever receives `{ user }`.

- `src/proxy.ts` (Next 16 middleware, matcher `/backoffice/:path*` + `/api/backend/:path*`): when `sc_at` is missing but
  `sc_rt` exists it calls `POST /auth/refresh`, sets the new cookies and passes the fresh access token to the same request
  as the `x-sc-access` header; anonymous visitors to `/backoffice/**` (except `/login`) are redirected to
  `/backoffice/login?next=…`. A failed refresh clears both cookies.
- `src/app/(backoffice)/backoffice/(app)/layout.tsx` (Server Component) calls `getBackofficeSession()` (`GET /auth/me`) and
  redirects non-admins/disabled accounts to the login page. UX only — `RoleMiddleware(.admin)` on the API is the boundary.
- Logout: `GET`/`POST /api/auth/logout` revokes the API session and clears the cookies (the shell links the GET).
- `AFTER_LOGIN_PATH` / `LOGIN_PATH` live in `src/lib/auth/paths.ts` (safe to import from client code; the rest of
  `src/lib/auth/*` is `server-only`).
- **Equipa** (`/backoffice/team`, was `clientes`): staff list (filters all/active/invited/disabled), detail
  with data, live sessions and access card; `InviteUserDialog` creates the account and shows the login link
  (`InviteResult.loginUrl`). No role picker — `UserRole` is only `admin` today.

### The website (rev. 4)

- **Phone first** — most clients come from their phones. Public controls are `components/site/fields.tsx` (`SiteInput`,
  `SiteSelect`, `SiteTextarea`, `SiteField`, `Chip`, `Tile`): ≥48 px targets, 16 px text (no iOS zoom; `ui/input` is also
  16 px below `sm`). Sticky header, `viewport` theme colour + `viewport-fit=cover` with `env(safe-area-inset-*)` paddings,
  `MobileActionBar` (WhatsApp + "Pedir orçamento" → `/request`, phones only, after the hero, hidden over `#quote`), gallery `Lightbox`
  (swipe, Esc, arrows, swipe down to close), WhatsApp/call buttons in the menu and on `/contact`.
- **Contacts**: a client gives a **mobile number or an e-mail** (at least one, `lib/site/contact.ts`: `isPhone`,
  `isEmail`). Every request is an order in the backoffice either way; phone-only orders get no automatic
  e-mails (the API skips them) and the backoffice says so (ClientCard banner + WhatsApp link, Conversa = internal notes).
- `components/site/SiteFrame.tsx` (header + footer; `PageContainer` for the narrow pages), `SiteHeader` (section links
  `/#work`, `/#services`, `/#how-it-works`, `/#where`, `/contact`, language switcher, "Pedir orçamento" → `/request`;
  `MobileMenu` below `xl`), `SiteFooter` (Instagram, Facebook, WhatsApp, contact, privacy).
- Home = `components/site/pages/HomePage.tsx` (server, `revalidate = 300` on the routes) → `components/site/home/`:
  `Hero` (gallery photos with placement `hero`, falling back to featured/first gallery photos), `Creations` (gallery +
  occasion filter, 12 at a time), `Services` (description + menu chips, link `/request?service=<slug>`), `Steps`, `Area`,
  `QuoteCta` (`#quote`, blush band, no form: "Pedir orçamento" → `/request`, WhatsApp, Contactos). Section colours follow
  the old site: hero `po`, gallery/services/area on `acucar`, how-to-order on the cream `#fbf6f1` band, quote on `merengue`,
  footer `cacau`. **One way to ask for a
  quote**: every "Pedir orçamento" (header, hero, service cards, phone bar, CTA) opens the dedicated `/request` flow. Text under `home.*` in the dictionaries; data from
  `publicApi.occasions/services/gallery`. Without the API the page still renders (empty gallery, placeholders).
- Business details (WhatsApp, Instagram, Facebook, location, service area, fallback service icons) in `src/content/site.ts`.
- `POST /api/revalidate {secret}` (`REVALIDATE_SECRET`, same as the API's) purges the public pages after backoffice edits.

### Orders, clients, contacts, Google (phase 3)

- **Public**: `/request` (+ `?occasion=<slug>` / `?service=<slug>` preselect from the home page) → `components/site/pages/RequestPage.tsx` loads
  occasions/services server-side (`lib/api/public.ts`, 5-min revalidate) and renders `RequestForm.tsx`, a **4-step flow**
  (event: occasion tiles + date/time/guests · what: service tiles → items with quantity steppers and an "Outro" line ·
  details: delivery (+address), EU-14 allergens, notes, photos (`PhotoDropzone kind="request"`, guest token from the BFF) ·
  contact: name + phone and/or e-mail, summary with "Alterar"). Sticky Back/Continue bar on phones, the browser back
  button steps back (`history.pushState`), the draft lives in `sessionStorage` (`sc:request-draft`). Honeypot `website`.
  Submits `api.orders.create` → `/request/sent?number=&email=&phone=` (which offers "Enviar também por WhatsApp" with the
  number pre-filled). `/contact` → `ContactForm` → `api.contact.send`.
  Strings under `request`, `sent`, `contact` in the dictionaries. The WhatsApp link comes from `src/content/site.ts`.
- **Encomendas** `/backoffice/orders` (tabs by status + "por ler", payment filter, search; `NewOrderDialog` registers
  offline orders) and `/backoffice/orders/[id]`: header with the API's `allowedTransitions` as buttons (note + "avisar o
  cliente" switch in a `ConfirmDialog`), tabs *Detalhes* (`RequestCard`, `OrderItemsEditor`, `DetailsCard` — one PATCH with
  only the changed fields, `ClientCard`, `ProposalCard`, `PaymentCard` in `components/backoffice/orders/`), *Conversa*
  (`OrderConversation`: e-mail thread + internal notes, composer with photo attachments, polls every 15 s) and *Histórico*.
- **Clientes** `/backoffice/clients` (+ `[id]`: orders, editable record, merge dialog, "Registar encomenda" for that
  client). **Contactos** `/backoffice/contacts` (handled toggle, convert to order). **Google** `/backoffice/settings/google`
  (connect → the API's consent URL → back here with `?connected=1|error=`, scopes, label, push-contacts toggle, outbox
  counters, retry failed e-mails).
- Labels for statuses/payment/delivery/source live in `src/lib/labels.ts`; hooks in `lib/backoffice/queries.ts`
  (`useOrders`, `useOrder`, `useOrderMessages`, `useOrderMutations`, `useClients`, `useClient`, `useClientMutations`,
  `useContacts`, `useContactMutations`, `useGoogleStatus`, `useGoogleMutations`).

### Styling

Tailwind 4 with the landing's tokens in `src/app/globals.css` (`@theme`: `acucar`, `po`, `po-fundo`, `cacau`,
`cacau-suave`, `merengue`, `folha`, plus platform `creme`/`linha`), fonts Young Serif (`font-display`) + Figtree
(`font-sans`) self-hosted via Fontsource, scalloped doily classes (`scallop-*`, `arch`). UI primitives in
`src/components/ui/` (Button, Input/Select/Textarea/Field, Card, Badge, Table, Skeleton, Modal, Switch) and backoffice
composites in `src/components/backoffice/` (Shell, Providers, DataTable, PageHeader, SearchInput, Tabs, StatCard,
ConfirmDialog, Toaster, InviteUserDialog, NewOrderDialog, LoginForm, UserBits, LocalizedTextInput, PhotoDropzone, DurationInput, DragHandle +
`lib/backoffice/useDragReorder`). No shadcn/Radix.

### Offering & gallery (phase 2)

- `LocalizedTextInput` edits `{pt, en?, es?, fr?}` with PT·EN·ES·FR tabs (pt required); `cleanLocalized` drops blanks
  before sending. `DurationInput` edits hours as days (½-day steps) or hours — the API stores hours.
- `PhotoDropzone kind=…` uploads straight to `POST /uploads` (3 in parallel) and hands back `Upload`s; the Galeria page
  queues them as "por legendar" cards and sends one `POST /admin/gallery/bulk`. Item photos use `kind: 'item'`.
- Reordering: `useDragReorder` + `PUT …/order {ids}`; the gallery only allows it in the unfiltered "Todas" view, since the
  API reorders the whole set.
- Pages: `/backoffice/gallery` (grid, filters by view/occasion in the URL, quick publish/feature, edit modal, delete),
  `/backoffice/services` (+ `[id]`: service fields, quantities, production defaults, menu items with per-item rules, tags,
  reference price, photo), `/backoffice/occasions` (inline list with toggles, modal editor).

### Conventions

- Backoffice routes `export const dynamic = 'force-dynamic'`; data via TanStack Query (`staleTime` 15 s, no retry on 401/403);
  mutations invalidate their key area; filters/search/page live in the URL (`useListParams`).
- Errors from the API → `apiErrorMessage` → toast (backoffice) or inline message (site).
- Never import `src/lib/api/config.ts` (BACKEND_URL) from client code.

## Status

Phase 0–2: scaffold, BFF, backoffice dashboard, team, gallery, services, occasions. **Phase 3 done (2026-10-30)**: own
sign-in (Auth0 and the client area removed), public `/request` + `/contact`, Encomendas with the e-mail conversation,
Clientes, Contactos, Definições → Google. **2026-11-03**: the landing's content ported — the platform is the website.
Next: inbound e-mail sync + inbox + Google Contacts (4), calendar (5), domain switch (6), hardening + passkeys (7).
