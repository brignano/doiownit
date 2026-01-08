import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface ExtendedToken extends JWT {
  steamId?: string;
}

interface ExtendedSession extends Session {
  user?: Session["user"] & {
    id?: string;
  };
}

// Steam provider using OpenID (compatible with next-auth-steam approach)
// Uses STEAM_API_KEY to fetch user profile from Steam Web API
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "steam",
      name: "Steam",
      type: "oidc",
      clientId: "steam",
      issuer: "https://steamcommunity.com/openid",
      authorization: {
        url: "https://steamcommunity.com/openid/login",
        params: {
          "openid.mode": "checkid_setup",
          "openid.ns": "http://specs.openid.net/auth/2.0",
          "openid.identity":
            "http://specs.openid.net/auth/2.0/identifier_select",
          "openid.claimed_id":
            "http://specs.openid.net/auth/2.0/identifier_select",
          "openid.return_to": `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
          "openid.realm": process.env.NEXTAUTH_URL || "http://localhost:3000",
        },
      },
      token: {
        async request() {
          // OpenID doesn't use tokens in the traditional OAuth2 sense
          // Steam ID is extracted from the callback URL
          return { tokens: {} };
        },
      },
      userinfo: {
        async request(context: { tokens: { steamId?: string } }) {
          const steamId = context.tokens.steamId;
          if (!steamId) {
            throw new Error("No Steam ID found");
          }

          // Fetch user info from Steam Web API
          const apiKey = process.env.STEAM_API_KEY;
          if (!apiKey) {
            throw new Error("STEAM_API_KEY is not configured");
          }

          const url = new URL(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002"
          );
          url.searchParams.set("key", apiKey);
          url.searchParams.set("steamids", steamId);

          const response = await fetch(url);
          const data = await response.json();
          const player = data.response.players[0];

          return {
            id: player.steamid,
            name: player.personaname,
            image: player.avatarfull,
            email: `${player.steamid}@steamcommunity.com`,
          };
        },
      },
      profile(profile: {
        id: string;
        name: string;
        image: string;
        email: string;
      }) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }): Promise<ExtendedToken> {
      // Store steam id in token
      if (account?.providerAccountId) {
        token.steamId = account.providerAccountId;
      }
      if (profile) {
        token.picture = profile.image as string;
        token.name = profile.name as string;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: ExtendedToken;
    }): Promise<ExtendedSession> {
      // Expose steam id, name, and avatar on session.user
      if (session.user && token.steamId) {
        const extendedUser = session.user as Session["user"] & {
          id?: string;
        };
        extendedUser.id = token.steamId;
        extendedUser.name = token.name || session.user.name;
        extendedUser.image = token.picture || session.user.image;
      }
      return session;
    },
  },
});

