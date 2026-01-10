import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/auth";

// Steam OpenID callback handler
export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const searchParams = request.nextUrl.searchParams;
    
    // Extract Steam ID from claimed_id parameter
    const claimedId = searchParams.get("openid.claimed_id") || "";
    const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);
    
    if (!steamIdMatch) {
      console.error("No Steam ID found in claimed_id:", claimedId);
      return NextResponse.redirect(
        new URL("/?error=NoSteamID", baseUrl)
      );
    }
    
    const steamId = steamIdMatch[1];
    
    // Verify the OpenID response
    const mode = searchParams.get("openid.mode");
    if (mode !== "id_res") {
      console.error("Invalid OpenID mode:", mode);
      return NextResponse.redirect(
        new URL("/?error=InvalidMode", baseUrl)
      );
    }
    
    // Verify the signature with Steam
    const verifyParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      verifyParams.append(key, value);
    });
    verifyParams.set("openid.mode", "check_authentication");
    
    const verifyResponse = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verifyParams.toString(),
    });
    
    const verifyText = await verifyResponse.text();
    console.log("Steam verification response:", verifyText);
    
    if (!verifyText.includes("is_valid:true")) {
      console.error("Steam verification failed - response was:", verifyText);
      return NextResponse.redirect(
        new URL("/?error=VerificationFailed", baseUrl)
      );
    }
    
    // Fetch user data from Steam API
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      console.error("STEAM_API_KEY not configured");
      return NextResponse.redirect(
        new URL("/?error=NoAPIKey", baseUrl)
      );
    }
    
    const playerUrl = new URL(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002"
    );
    playerUrl.searchParams.set("key", apiKey);
    playerUrl.searchParams.set("steamids", steamId);
    
    console.log("Fetching player data for Steam ID:", steamId);
    
    const playerResponse = await fetch(playerUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!playerResponse.ok) {
      console.error("Steam API request failed with status:", playerResponse.status);
      const errorText = await playerResponse.text();
      console.error("Steam API error response:", errorText);
      return NextResponse.redirect(
        new URL("/?error=SteamAPIError", baseUrl)
      );
    }
    
    let playerData;
    try {
      playerData = await playerResponse.json();
    } catch (parseError) {
      console.error("Failed to parse Steam API response as JSON:", parseError);
      return NextResponse.redirect(
        new URL("/?error=InvalidSteamResponse", baseUrl)
      );
    }
    
    const player = playerData.response?.players?.[0];
    
    if (!player) {
      console.error("Failed to fetch player data for Steam ID:", steamId);
      console.error("Player data response:", playerData);
      return NextResponse.redirect(
        new URL("/?error=NoPlayerData", baseUrl)
      );
    }
    
    // Store user data in cookie for the credentials provider to pick up
    const cookieStore = await cookies();
    const userData = {
      id: player.steamid,
      name: player.personaname,
      image: player.avatarfull,
      email: `${player.steamid}@steamcommunity.com`,
    };
    
    cookieStore.set("steam-user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // 1 minute - just enough time to complete the sign-in
      path: "/",
    });
    
    // Redirect to a page that will trigger the sign-in client-side
    const signinUrl = new URL("/steam-signin", baseUrl);
    return NextResponse.redirect(signinUrl);
  } catch (error) {
    console.error("Steam auth error:", error);
    return NextResponse.redirect(
      new URL("/?error=Unknown", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}
