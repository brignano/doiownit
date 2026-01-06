# DoIOwnIt 🎮

A unified game library aggregator that allows you to sign in with Steam and Epic Games to view all your owned games in one place using pure OAuth 2.0 authentication.

## Features

- **OAuth 2.0 Authentication**: Sign in securely with Steam and Epic Games
- **Multi-Platform Support**: Aggregate games from:
  - Steam
  - Epic Games
  - (Coming soon) GOG
  - (Coming soon) PlayStation Network
  - (Coming soon) Xbox Game Pass
- **Unified Dashboard**: View all your games across all platforms in one interface
- **Search & Filter**: Easily search for games and filter by platform
- **Game Statistics**: See total games owned and playtime statistics
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Pure OAuth**: No hardcoded tokens—uses OAuth 2.0 access tokens from providers

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Authentication**: NextAuth.js v5 (OAuth 2.0)
- **Styling**: Tailwind CSS v4
- **API Client**: Axios
- **Game Providers**: Steam OAuth & Epic Games OAuth

## Getting Started

### Prerequisites

- Node.js 22.4.1 or higher
- npm 10.8.1 or higher
- Git
- Steam account (for testing)
- Epic Games account (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brignano/doiownit.git
cd doiownit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure OAuth providers in `.env.local`:

#### Steam OAuth Setup
1. Go to https://steamcommunity.com/dev/registerapp
2. Create a new Steam application
3. In OAuth settings, add redirect URI: `http://localhost:3000/api/auth/callback/steam`
4. Copy Application ID and Client Secret to `.env.local` as `STEAM_OAUTH_ID` and `STEAM_OAUTH_SECRET`
5. (Optional) Get Web API Key from https://steamcommunity.com/dev/apikey for game fetching

#### Epic Games OAuth Setup
1. Go to https://dev.epicgames.com/
2. Create a new OAuth application
3. Add redirect URI: `http://localhost:3000/api/auth/callback/epic`
4. Copy Client ID and Client Secret to `.env.local` as `EPIC_OAUTH_ID` and `EPIC_OAUTH_SECRET`

#### NextAuth Secret
Generate a secure secret:
```bash
openssl rand -hex 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env.local`

Your `.env.local` should contain:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
STEAM_OAUTH_ID=your-steam-id
STEAM_OAUTH_SECRET=your-steam-secret
STEAM_WEB_API_KEY=your-steam-api-key
EPIC_OAUTH_ID=your-epic-id
EPIC_OAUTH_SECRET=your-epic-secret
```

For detailed setup instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   └── games/                  # Games API endpoint
│   ├── auth/
│   │   └── signin/                 # Sign-in page
│   ├── dashboard/                  # Main dashboard page
│   ├── layout.tsx                  # Root layout with SessionProvider
│   ├── page.tsx                    # Home page (redirects to dashboard)
│   └── globals.css
├── lib/
│   └── gameProviders.ts            # Game provider API services
├── auth.ts                         # NextAuth configuration
└── middleware.ts                   # Optional: route protection
```

## API Integration Guide

### Adding a New Game Provider

1. Add a new provider service function in `src/lib/gameProviders.ts`:

```typescript
export const getNewProviderGames = async (
  accessToken: string
): Promise<Game[]> => {
  try {
    const response = await axios.get("https://api.provider.com/games", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return (response.data.games || []).map(
      (game: Record<string, unknown>) => ({
        id: `provider_${game.id}`,
        name: game.name,
        platform: "Provider Name",
        image: game.image,
      })
    );
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};
```

2. Add the provider to NextAuth in `src/auth.ts`:

```typescript
import NewProvider from "next-auth/providers/newprovider";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    NewProvider({
      clientId: process.env.NEW_PROVIDER_ID,
      clientSecret: process.env.NEW_PROVIDER_SECRET,
    }),
    // ... other providers
  ],
  // ... rest of config
});
```

3. Call the function in `src/app/api/games/route.ts`:

```typescript
if (user.provider === "newprovider") {
  const games = await getNewProviderGames(user.accessToken || "");
  allGames.push(...games);
}
```

## Environment Variables

See `.env.example` for all required environment variables.

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Database integration for storing user game libraries
- [ ] Steam OAuth implementation
- [ ] Epic Games API integration
- [ ] GOG API integration
- [ ] PlayStation Network API integration
- [ ] Xbox Game Pass API integration
- [ ] Game recommendations based on library
- [ ] Game comparison between friends
- [ ] Achievement tracking
- [ ] Play statistics and analytics
- [ ] Mobile app

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository or contact the maintainers.

## Acknowledgments

- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
