import { auth } from "@/auth";
import {
  getSteamGames,
  getEpicGames,
  type Game,
} from "@/lib/gameProviders";
import { getLinkedAccounts } from "@/lib/linkedAccounts";

interface ExtendedUser {
  accessToken?: string;
  refreshToken?: string;
  provider?: string;
  providerAccountId?: string;
  id?: string;
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as (typeof session.user) & ExtendedUser;
  const allGames: Game[] = [];

  // Get all linked accounts
  const linkedAccounts = await getLinkedAccounts();
  
  // If user has linked accounts, fetch from all of them
  // Provider names: "steam", "epic", "gog", etc. (lowercase)
  if (linkedAccounts.length > 0) {
    for (const account of linkedAccounts) {
      if (account.provider === "steam" && account.providerId) {
        const steamGames = await getSteamGames(account.providerId);
        allGames.push(...steamGames);
      }
      
      if (account.provider === "epic" && account.accessToken) {
        const epicGames = await getEpicGames(account.accessToken);
        allGames.push(...epicGames);
      }
    }
  } else {
    // Fallback to old behavior if no linked accounts (for backward compatibility)
    // Fetch games from current session provider
    if (user.provider === "steam" && user.id) {
      const steamGames = await getSteamGames(user.id);
      allGames.push(...steamGames);
    }

    if (user.provider === "epic" && user.accessToken) {
      const epicGames = await getEpicGames(user.accessToken);
      allGames.push(...epicGames);
    }
  }

  // Remove duplicates based on game name
  const uniqueGames = Array.from(
    new Map(allGames.map((game) => [game.name.toLowerCase(), game])).values()
  );

  return Response.json({
    games: uniqueGames,
    totalCount: uniqueGames.length,
  });
}
