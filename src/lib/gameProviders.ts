import axios from "axios";

export interface Game {
  id: string;
  name: string;
  platform: string;
  image?: string;
  playtimeMinutes?: number;
  releaseDate?: string;
}

// Steam OAuth - Get games using Steam ID
export const getSteamGames = async (steamId: string): Promise<Game[]> => {
  try {
    // Get owned games using the Steam ID directly
    const gamesResponse = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`,
      {
        params: {
          key: process.env.STEAM_API_KEY,
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    );

    if (!gamesResponse.data.response.games) {
      return [];
    }

    return gamesResponse.data.response.games.map((game: Record<string, unknown>) => ({
      id: `steam_${game.appid}`,
      name: game.name,
      platform: "Steam",
      playtimeMinutes: game.playtime_forever,
      image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    }));
  } catch (error) {
    console.error("Error fetching Steam games:", error);
    return [];
  }
};

// Epic Games OAuth - Get games using OAuth access token
export const getEpicGames = async (accessToken: string): Promise<Game[]> => {
  try {
    // Get user's library from Epic Games
    const response = await axios.get(
      `https://api.epicgames.dev/epic/oauth/v2/library`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return (response.data.records || []).map((game: Record<string, unknown>) => {
      const metadata = game.metadata as Record<string, unknown>;
      const keyImages = metadata.keyImages as Array<Record<string, unknown>>;
      return {
        id: `epic_${game.catalogItemId}`,
        name: game.appName || game.displayName,
        platform: "Epic Games",
        image: keyImages?.[0]?.url,
      };
    });
  } catch (error) {
    console.error("Error fetching Epic Games:", error);
    return [];
  }
};

// GOG API Service (for future implementation)
export const getGOGGames = async (accessToken: string): Promise<Game[]> => {
  try {
    const response = await axios.get(`https://api.gog.com/users/me/games`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return (response.data.games || []).map((game: Record<string, unknown>) => ({
      id: `gog_${game.id}`,
      name: game.title,
      platform: "GOG",
      image: (game.images as Record<string, unknown>)?.logo,
    }));
  } catch (error) {
    console.error("Error fetching GOG games:", error);
    return [];
  }
};

// PlayStation Network API Service (for future implementation)
export const getPSNGames = async (accessToken: string): Promise<Game[]> => {
  try {
    await axios.get(
      `https://psn.np.community.playstation.net/userProfile/v2/me/profile2`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // This would require additional API calls to get full game list
    // This is a simplified example
    return [];
  } catch (error) {
    console.error("Error fetching PSN games:", error);
    return [];
  }
};

// Xbox Game Pass API Service (for future implementation)
export const getXboxGames = async (accessToken: string): Promise<Game[]> => {
  try {
    const response = await axios.get(
      `https://xboxlive.proxycon.xbox.com/users/me/library`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return (response.data.titles || []).map((game: Record<string, unknown>) => ({
      id: `xbox_${game.titleId}`,
      name: game.name,
      platform: "Xbox",
      image: game.displayImage,
    }));
  } catch (error) {
    console.error("Error fetching Xbox games:", error);
    return [];
  }
};

