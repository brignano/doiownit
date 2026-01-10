import axios from "axios";

export interface Game {
  id: string;
  name: string;
  platform: string;
  image?: string;
  playtimeMinutes?: number;
  releaseDate?: string;
  categories?: string[];
  tags?: string[];
}

// Configuration constants
const STEAM_DETAILED_GAMES_LIMIT = 50; // Limit for fetching detailed game info to avoid rate limits
const STEAM_API_DELAY_MS = 200; // Delay between Steam API calls to avoid rate limiting

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

    // Helper function to add delay for rate limiting
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Fetch detailed app info for categories and tags
    const gamesWithDetails = [];
    const gamesToFetch = gamesResponse.data.response.games.slice(0, STEAM_DETAILED_GAMES_LIMIT);
    
    for (let i = 0; i < gamesToFetch.length; i++) {
      const game = gamesToFetch[i] as Record<string, unknown>;
      
      try {
        // Fetch store details for categories and tags
        const detailsResponse = await axios.get(
          `https://store.steampowered.com/api/appdetails`,
          {
            params: {
              appids: game.appid,
            },
          }
        );

        const appData = detailsResponse.data?.[game.appid as string]?.data;
        const categories = appData?.categories?.map((cat: Record<string, unknown>) => cat.description as string) || [];
        const genres = appData?.genres?.map((genre: Record<string, unknown>) => genre.description as string) || [];
        
        gamesWithDetails.push({
          id: `steam_${game.appid}`,
          name: game.name,
          platform: "Steam",
          playtimeMinutes: game.playtime_forever,
          image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          categories: categories,
          tags: genres,
        });
        
        // Add a delay between requests to avoid rate limiting
        if (i < gamesToFetch.length - 1) {
          await delay(STEAM_API_DELAY_MS);
        }
      } catch (error) {
        // If details fetch fails, return game without categories/tags
        gamesWithDetails.push({
          id: `steam_${game.appid}`,
          name: game.name,
          platform: "Steam",
          playtimeMinutes: game.playtime_forever,
          image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          categories: [],
          tags: [],
        });
      }
    }

    // For remaining games (if any), return without detailed info
    const remainingGames = gamesResponse.data.response.games.slice(STEAM_DETAILED_GAMES_LIMIT).map((game: Record<string, unknown>) => ({
      id: `steam_${game.appid}`,
      name: game.name,
      platform: "Steam",
      playtimeMinutes: game.playtime_forever,
      image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
      categories: [],
      tags: [],
    }));

    return [...gamesWithDetails, ...remainingGames];
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
      const categories = metadata.categories as string[] || [];
      const genres = metadata.genres as string[] || [];
      
      return {
        id: `epic_${game.catalogItemId}`,
        name: game.appName || game.displayName,
        platform: "Epic Games",
        image: keyImages?.[0]?.url,
        categories: categories,
        tags: genres,
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

