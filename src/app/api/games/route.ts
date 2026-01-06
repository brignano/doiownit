import { auth } from "@/auth";
import {
    getSteamGames,
    getEpicGames,
    type Game,
} from "@/lib/gameProviders";

interface ExtendedUser {
  accessToken?: string;
  refreshToken?: string;
  provider?: string;
  providerAccountId?: string;
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as (typeof session.user) & ExtendedUser;
  const allGames: Game[] = [];

  // Fetch games from enabled providers using OAuth access tokens
  if (user.accessToken) {
    // Steam OAuth
    if (user.provider === "steam") {
      const steamGames = await getSteamGames(user.accessToken);
      allGames.push(...steamGames);
    }

    // Epic Games OAuth
    if (user.provider === "epic") {
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
