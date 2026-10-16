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
on `http://localhost:8080`, then `pnpm dev`. Without the API the public pages render; the client area and the backoffice
return `upstream.unreachable`.

## What this is

**Next.js 16 App Router** (TypeScript, Tailwind CSS 4) — the Sobremesas & Companhia **platform** at
`dev.sobremesasecompanhia.pt`: request form (phase 3), client area `/conta`, backoffice `/backoffice`. The presentation
site is a separate static project (`../landing`, GitHub Pages at `sobremesasecompanhia.pt`). All data comes from the
**Vapor API** in `../backend` (see its `CLAUDE.md` and `Public/openapi.yaml`); this app has no database. Design document:
`../docs/PLATFORM-PLAN.md`. Plumbing is derived from `CookieBytes/Brindigrafica/frontend`; the look from `../landing`.

## Architecture

### Data flow — BFF pattern

```
Browser ──► /api/backend/<path>  (src/app/api/backend/[...path]/route.ts) ──► {BACKEND_URL}/api/v1/<path>
             • adds Authorization: Bearer <Auth0 access token> from the server-side session
             • for visitors: mints the guest form-session token on the first POST /uploads|/requests,
               keeps it in the httpOnly cookie `sc_upload` (24 h) and sends it as X-Upload-Token
Browser ──► /api/auth/me          (src/app/api/auth/me/route.ts): session ↔ API user bridge (POST /auth/login)
Server Components ──► lib/backoffice/session.ts (getBackofficeSession) for the admin guard
```

- `src/lib/api/types.ts` — TypeScript mirrors of the API DTOs. **Keep in sync with `backend/Sources/App/DTOs`.**
- `src/lib/api/client.ts` — browser client (`api.auth.me()`, `api.me.*`, `api.uploads.upload()`), always through the proxy.
- `src/lib/api/backoffice.ts` + `src/lib/backoffice/queries.ts` — typed `/admin/*` calls and TanStack Query hooks/keys.
- `src/lib/api/errors.ts` — `ApiError {status, code, reason}` and `apiErrorMessage(err)` in the page's language.
- `src/lib/session.ts` — `useSession()` for the site/client area (`loading | anonymous | disabled | authenticated`).
- Query params sent to the API are English; public URLs are Portuguese (`/conta/definicoes`) in every language.

### Languages (pt / en / es / fr) — same approach as the landing

- Portuguese is unprefixed (`/conta`); the others are route segments (`/en/conta`). `src/app/(site)/(pt)/**` and
  `src/app/(site)/[lang]/**` are thin wrappers around shared page components in `src/components/site/pages/`.
- Text: `src/i18n/dictionaries/{pt,en,es,fr}.ts` — `pt.ts` is the reference and defines `Dictionary`, so a missing key fails
  the build. `getDictionary(locale)`, `fmt()` for placeholders. Helpers in `src/lib/locale.ts`: `localizedPath`, `loginHref`
  (adds `returnTo` + `ui_locales` + optional `screen_hint=signup`), `splitLocale`, `documentLocale` (from `<html lang>`).
- The browser client sends `Accept-Language` from `<html lang>`; `/api/auth/me` forwards it so the API seeds `user.locale`
  on the first sign-in. Changing the language in `/conta/definicoes` saves `PATCH /me {locale}` then navigates.
- Backoffice is **pt-PT only** (`src/app/(backoffice)/layout.tsx`), formatting via `src/lib/labels.ts`.

### Auth

Auth0 via `@auth0/nextjs-auth0` v4. `src/proxy.ts` (Next 16 name for middleware) mounts `/auth/login`, `/auth/callback`,
`/auth/logout`, `/auth/profile`. `src/lib/auth0.ts` requests `AUTH0_AUDIENCE` so the access token is an RS256 JWT the Vapor
API can verify — **without it every authenticated call 401s**. Sign-up is `/auth/login?screen_hint=signup`.

- Client area: `RequireAuth` (client component) redirects anonymous visitors to Auth0 and shows the API's reason for
  disabled accounts.
- Backoffice: `src/app/(backoffice)/backoffice/layout.tsx` is a Server Component that calls `getBackofficeSession()` and
  redirects non-admins. UX only — `RoleMiddleware(.admin)` on the API is the security boundary.

### Styling

Tailwind 4 with the landing's tokens in `src/app/globals.css` (`@theme`: `acucar`, `po`, `po-fundo`, `cacau`,
`cacau-suave`, `merengue`, `folha`, plus platform `creme`/`linha`), fonts Young Serif (`font-display`) + Figtree
(`font-sans`) self-hosted via Fontsource, scalloped doily classes (`scallop-*`, `arch`). UI primitives in
`src/components/ui/` (Button, Input/Select/Textarea/Field, Card, Badge, Table, Skeleton, Modal, Switch) and backoffice
composites in `src/components/backoffice/` (Shell, Providers, DataTable, PageHeader, SearchInput, Tabs, StatCard,
ConfirmDialog, Toaster, InviteUserDialog, UserBits). No shadcn/Radix.

### Conventions

- Backoffice routes `export const dynamic = 'force-dynamic'`; data via TanStack Query (`staleTime` 15 s, no retry on 401/403);
  mutations invalidate their key area; filters/search/page live in the URL (`useListParams`).
- Errors from the API → `apiErrorMessage` → toast (backoffice) or inline message (site).
- Never import `src/lib/api/config.ts` (BACKEND_URL) from client code.

## Status

Phase 0–1: scaffold, auth, BFF, client area (`/conta`, `/conta/definicoes`), backoffice dashboard + `clientes`
(list, detail, invite, disable/enable, delete). Next: offering + gallery (phase 2), requests (3), calendar (4), threads (5).
