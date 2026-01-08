# NextAuth Steam Authentication Setup

This guide explains how to set up NextAuth with Steam authentication for the DoIOwnIt application.

## Overview

The application uses NextAuth.js (v5) with Steam as an authentication provider. Steam uses OpenID for authentication and requires a Steam Web API key to fetch user profile data.

## Installation

Install the required dependencies:

```bash
npm install next-auth next-auth-steam
```

## Local Development Setup

### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Get a Steam Web API Key

1. Go to [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account
3. **Important**: In the "Domain Name" field, enter exactly: `localhost:3000` (for local development)
4. Copy the API key and save it for step 4

**Note**: Steam's domain validation is critical. For the "invalid return url" error:
- The domain you register must match your `NEXTAUTH_URL`
- The application will automatically use the correct callback URL: `http://localhost:3000/api/auth/callback/steam`
- If you change your domain later, you must re-generate your API key with the new domain

### 3. Generate NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
openssl rand -hex 32
```

### 4. Configure Environment Variables

Update your `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>
STEAM_API_KEY=<your-steam-api-key>
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## How Steam Authentication Works

1. **OpenID Authentication**: Steam uses OpenID 2.0 for authentication (not OAuth 2.0). This is an older but well-supported standard.

2. **Steam Web API**: After authentication, the Steam Web API is used to fetch the user's profile information (name, avatar, etc.) using the STEAM_API_KEY.

3. **Session Management**: NextAuth manages the session and provides `useSession()` hook for client-side access and `auth()` function for server-side access.

## Vercel Deployment

### Required Environment Variables

Set the following environment variables in your Vercel project settings:

```env
NEXTAUTH_URL=https://doiownit.brignano.io
NEXTAUTH_SECRET=<your-generated-secret>
STEAM_API_KEY=<your-steam-api-key>
```

### Deployment Checklist

- [ ] Set `NEXTAUTH_URL` to your production domain (e.g., `https://doiownit.brignano.io`)
- [ ] Generate and set a new `NEXTAUTH_SECRET` for production (never reuse dev secrets)
- [ ] Set your `STEAM_API_KEY` (the same key can be used for dev and production)
- [ ] Update your Steam API key domain to match your production domain at [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
- [ ] Deploy and test the authentication flow

## Usage

### Client Component (React)

```tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        Signed in as {session.user?.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn("steam")}>Sign in with Steam</button>
    </>
  );
}
```

### Server Component (React Server Components)

```tsx
import { auth } from "@/auth";

export default async function ServerComponent() {
  const session = await auth();

  if (session) {
    return <div>Signed in as {session.user?.name}</div>;
  }

  return <div>Not signed in</div>;
}
```

## API Routes

The NextAuth API routes are configured at:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/steam` - Steam callback URL

## Troubleshooting

### "STEAM_API_KEY is not configured" Error

Make sure you have set the `STEAM_API_KEY` environment variable in your `.env.local` file (for local development) or in your Vercel environment variables (for production).

### Authentication Loop or Redirect Issues

- Verify that `NEXTAUTH_URL` matches your actual domain (including protocol: `http://` or `https://`)
- For Vercel, make sure to set environment variables for the Production environment
- Clear your browser cookies and try again

### Steam Login Not Working

- Check that your Steam Web API key is valid at [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
- Verify the domain registered with your API key matches your `NEXTAUTH_URL`
- Steam OpenID requires the domain to be publicly accessible (for production)

## Notes

- **next-auth-steam Package**: This project uses the `next-auth-steam` community package which provides Steam OpenID integration. Note that while the package is designed for NextAuth v4, we've adapted it for use with NextAuth v5 by implementing a compatible provider configuration.

- **OpenID vs OAuth**: Steam uses OpenID 2.0, not OAuth 2.0. This means there are no client secrets or OAuth scopes - authentication is handled through OpenID protocol, and user data is fetched via the Steam Web API.

- **Email Address**: Steam doesn't provide email addresses through OpenID. The application generates a pseudo-email using the format `<steamid>@steamcommunity.com` for NextAuth compatibility.

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Steam Web API Documentation](https://steamcommunity.com/dev)
- [Steam OpenID Documentation](https://steamcommunity.com/dev)
- [next-auth-steam Package](https://www.npmjs.com/package/next-auth-steam)
