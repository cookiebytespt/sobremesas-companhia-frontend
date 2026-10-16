# Sobremesas & Companhia — platform

Next.js 16 app for `dev.sobremesasecompanhia.pt`: request form, client area and backoffice over the Vapor API in
`../backend`. The presentation site lives in `../landing` (static, GitHub Pages). Design: `../docs/PLATFORM-PLAN.md`.

```bash
nvm use && pnpm install
cp .env.example .env.local      # Auth0 app credentials + BACKEND_URL
pnpm dev                        # http://localhost:3000
```

Deploy: Vercel project on the CookieBytes team, production branch `main`, domain `dev.sobremesasecompanhia.pt`.
Environment variables are the ones in `.env.example` (`APP_BASE_URL=https://dev.sobremesasecompanhia.pt`,
`BACKEND_URL=https://api.sobremesasecompanhia.pt`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_LANDING_URL`).

See `CLAUDE.md` for the architecture.
