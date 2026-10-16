import { Auth0Client } from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  authorizationParameters: {
    // AUTH0_AUDIENCE is required to receive a signed JWT the Vapor API can validate; without it
    // Auth0 issues an opaque token and every authenticated call 401s.
    ...(process.env.AUTH0_AUDIENCE && { audience: process.env.AUTH0_AUDIENCE }),
    scope: 'openid profile email offline_access',
    // Default language of Universal Login; links from the other languages pass `?ui_locales=`
    // (see `loginHref` in lib/locale.ts).
    ui_locales: 'pt-PT',
  },
})
