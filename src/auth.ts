import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

interface ExtendedToken extends JWT {
  steamId?: string;
}

interface ExtendedSession extends Session {
  user?: Session["user"] & {
    id?: string;
  };
}

// Steam Credentials provider for NextAuth v5
// Reads user data from cookie set by Steam OpenID callback
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "steam",
      name: "Steam",
      credentials: {},
      async authorize() {
        // Read user data from cookie set by Steam callback
        const cookieStore = await cookies();
        const steamUserCookie = cookieStore.get("steam-user");
        
        if (!steamUserCookie) {
          return null;
        }
        
        try {
          const userData = JSON.parse(steamUserCookie.value);
          
          // Clear the cookie after reading
          cookieStore.delete("steam-user");
          
          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            image: userData.image,
          };
        } catch (error) {
          console.error("Failed to parse steam user data:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedToken> {
      if (user) {
        token.steamId = user.id;
        token.picture = user.image;
        token.name = user.name;
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

