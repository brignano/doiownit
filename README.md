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

### Option 1: Using Dev Container (Recommended)

The easiest way to get started is using the development container, which provides a pre-configured environment with all dependencies installed automatically.

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Git
- Steam account (for testing)
- Epic Games account (for testing)

**Steps:**
1. Clone the repository:
```bash
git clone https://github.com/brignano/doiownit.git
cd doiownit
```

2. Open the repository in VS Code and reopen in container when prompted (or use Command Palette: `Dev Containers: Reopen in Container`)

3. Wait for the container to build and dependencies to install automatically

4. Set up environment variables (see configuration section below)

5. Run the development server:
```bash
npm run dev
```

See [.devcontainer/README.md](.devcontainer/README.md) for more details about the dev container setup.

### Option 2: Local Installation

**Prerequisites:**
- Node.js 22.4.1 or higher
- npm 10.8.1 or higher
- Git
- Steam account (for testing)
- Epic Games account (for testing)

**Steps:**
1. Clone the repository:
```bash
git clone https://github.com/brignano/doiownit.git
cd doiownit
```

2. Install dependencies:
```bash
npm install
```

### Configuration

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Get your Steam Web API Key:
   - Go to https://steamcommunity.com/dev/apikey
   - Log in with your Steam account
   - Enter your domain (e.g., `localhost:3000` for development)
   - Copy your API key and add it to `.env.local`

5. Generate a NextAuth secret:
```bash
openssl rand -hex 32
```
Copy the output to `NEXTAUTH_SECRET` in `.env.local`

Your `.env.local` should contain:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
STEAM_API_KEY=your-steam-api-key-here
```

**Note**: Epic Games authentication is not yet implemented. See [README_AUTH.md](./README_AUTH.md) for detailed authentication setup instructions.

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
│   │   ├── auth/[...nextauth]/     # NextAuth API routes
│   │   ├── games/                  # Games API endpoint
│   │   ├── steam/                  # Steam authentication routes
│   │   └── linked-accounts/        # Account linking management
│   ├── auth/
│   │   └── signin/                 # Sign-in page
│   ├── dashboard/                  # Main dashboard with game library
│   ├── steam-signin/               # Steam OpenID signin handler
│   ├── layout.tsx                  # Root layout with SessionProvider
│   ├── page.tsx                    # Home page (redirects to dashboard)
│   └── globals.css
├── components/
│   └── Navbar.tsx                  # Navigation component
├── lib/
│   └── gameProviders.ts            # Game provider API services
└── auth.ts                         # NextAuth configuration with CredentialsProvider
```

## Adding a New Game Provider

The application uses a modular provider system. Here's how to add a new game provider:

### 1. Implement the Provider Service in `src/lib/gameProviders.ts`

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
        playtime: game.playtime_hours || 0,
      })
    );
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};
```

### 2. Create Authentication Routes

Add routes for the provider's OAuth flow in `src/app/api/{provider}/`:
- `login/route.ts` - Initiates the OAuth flow
- `callback/route.ts` - Handles the OAuth callback and stores credentials

### 3. Update NextAuth Configuration in `src/auth.ts`

Add the provider to the CredentialsProvider or create a new provider:

```typescript
// Store the access token in the session/JWT for later API calls
session.user.accessToken = token.accessToken;
session.user.provider = "newprovider";
```

### 4. Call the Provider Function in `src/app/api/games/route.ts`

```typescript
import { getNewProviderGames } from "@/lib/gameProviders";

// Inside the games API route:
if (user.provider === "newprovider" && user.accessToken) {
  const games = await getNewProviderGames(user.accessToken);
  allGames.push(...games);
}
```

### 5. Add Sign-In Button in `src/app/auth/signin/page.tsx`

```tsx
<button onClick={() => signIn("newprovider")}>
  Sign in with New Provider
</button>
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

### Completed
- [x] Steam OpenID authentication with Web API integration
- [x] Multi-platform game library aggregation (currently Steam)
- [x] Dashboard with game tiles, search, and filtering
- [x] API response caching to prevent excessive provider calls
- [x] NextAuth.js v5 integration with custom CredentialsProvider
- [x] Responsive UI with Tailwind CSS

### In Progress / Planned
- [ ] Epic Games OAuth integration
- [ ] GOG API integration
- [ ] PlayStation Network API integration
- [ ] Xbox Game Pass API integration
- [ ] Database integration for storing user game libraries
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
