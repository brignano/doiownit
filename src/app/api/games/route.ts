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
  id?: string;
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as (typeof session.user) & ExtendedUser;
  const allGames: Game[] = [];

  // Fetch games from enabled providers
  if (user.provider === "steam" && user.id) {
    // Use the Steam ID to fetch games from Steam API
    const steamGames = await getSteamGames(user.id);
    allGames.push(...steamGames);
  }

  // Epic Games OAuth
  if (user.provider === "epic" && user.accessToken) {
    const epicGames = await getEpicGames(user.accessToken);
    allGames.push(...epicGames);
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
