import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  provider?: string;
  providerAccountId?: string;
}

interface ExtendedSession extends Session {
  user?: Session["user"] & {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    providerAccountId?: string;
  };
}

interface TokenRequestContext {
  provider: {
    clientId: string;
    clientSecret: string;
    token: { url: string };
    callbackUrl: string;
  };
  params: {
    code?: string;
  };
}

interface UserInfoRequestContext {
  provider: {
    userinfo: { url: string };
  };
  tokens: {
    access_token: string;
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "steam",
      name: "Steam",
      type: "oauth",
      clientId: process.env.STEAM_OAUTH_ID,
      clientSecret: process.env.STEAM_OAUTH_SECRET,
      authorization: {
        url: "https://steamcommunity.com/oauth/authorize",
        params: {
          scope: "openid profile email",
        },
      },
      token: {
        url: "https://steamcommunity.com/oauth/token",
        async request(context: TokenRequestContext) {
          const response = await fetch(context.provider.token.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: context.provider.clientId,
              client_secret: context.provider.clientSecret,
              code: context.params.code!,
              grant_type: "authorization_code",
              redirect_uri: context.provider.callbackUrl,
            }).toString(),
          });

          const tokens = await response.json();

          return tokens;
        },
      },
      userinfo: {
        url: "https://steamcommunity.com/oauth/user",
        async request(context: UserInfoRequestContext) {
          const response = await fetch(context.provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });

          const user = await response.json();

          return {
            id: user.steamid,
            name: user.username || user.personaname,
            image: user.avatar,
            email: user.email,
          };
        },
      },
      profile(profile: Record<string, unknown>) {
        return {
          id: String(profile.id || profile.steamid),
          name: String(profile.name || profile.username),
          email: String(profile.email) || null,
          image: String(profile.image || profile.avatar) || null,
        };
      },
    },
    {
      id: "epic",
      name: "Epic Games",
      type: "oauth",
      clientId: process.env.EPIC_OAUTH_ID,
      clientSecret: process.env.EPIC_OAUTH_SECRET,
      authorization: {
        url: "https://www.epicgames.com/id/oauth/authorize",
        params: {
          scope: "openid profile email",
        },
      },
      token: {
        url: "https://api.epicgames.dev/identity/api/v1/oauth/token",
        async request(context: TokenRequestContext) {
          const auth = Buffer.from(
            `${context.provider.clientId}:${context.provider.clientSecret}`
          ).toString("base64");

          const response = await fetch(context.provider.token.url, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code: context.params.code!,
              grant_type: "authorization_code",
              redirect_uri: context.provider.callbackUrl,
            }).toString(),
          });

          const tokens = await response.json();

          return tokens;
        },
      },
      userinfo: {
        url: "https://api.epicgames.dev/epic/oauth/v2/userInfo",
        async request(context: UserInfoRequestContext) {
          const response = await fetch(context.provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });

          const user = await response.json();

          return {
            id: user.sub,
            name: user.name || user.preferred_username,
            email: user.email,
            image: user.picture,
          };
        },
      },
      profile(profile: Record<string, unknown>) {
        return {
          id: String(profile.id || profile.sub),
          name: String(profile.name || profile.preferred_username),
          email: String(profile.email) || null,
          image: String(profile.image || profile.picture) || null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }): Promise<ExtendedToken> {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (profile) {
        token.image = profile.image;
        token.name = profile.name;
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
      if (session.user) {
        const extendedUser = session.user as Session["user"] & {
          accessToken?: string;
          refreshToken?: string;
          provider?: string;
          providerAccountId?: string;
        };
        extendedUser.accessToken = token.accessToken;
        extendedUser.refreshToken = token.refreshToken;
        extendedUser.provider = token.provider;
        extendedUser.providerAccountId = token.providerAccountId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

