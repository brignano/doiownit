import { getBaseUrl } from "@/auth";
import axios from "axios";
import { cookies } from "next/headers";
import { addLinkedAccount } from "@/lib/linkedAccounts";

interface EpicTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface EpicUserResponse {
  account_id: string;
  name: string;
  email: string;
  picture?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("Epic callback received:", { code: code ? "present" : "missing", state, error, errorDescription });

  // Check for OAuth error response from Epic
  if (error) {
    console.error("Epic OAuth error:", error, errorDescription);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?error=epic_${error}`,
      },
    });
  }

  // Validate request
  if (!code) {
    console.error("Missing authorization code");
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?error=missing_code`,
      },
    });
  }

  // Verify state token
  const cookieStore = await cookies();
  const storedState = cookieStore.get("epic-oauth-state")?.value;
  if (!state || state !== storedState) {
    console.error("Invalid state token:", { received: state, stored: storedState });
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?error=invalid_state`,
      },
    });
  }

  const baseUrl = getBaseUrl();
  const clientId = process.env.EPIC_CLIENT_ID;
  const clientSecret = process.env.EPIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Epic Games credentials not configured");
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?error=not_configured`,
      },
    });
  }

  try {
    console.log("Exchanging authorization code for token...");
    // Exchange code for access token
    const tokenResponse = await axios.post<EpicTokenResponse>(
      "https://launcher.epicgames.com/oauth/token",
      {
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/epic/callback`,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    console.log("Token exchange successful, fetching user info...");

    // Get user info
    const userResponse = await axios.get<EpicUserResponse>(
      "https://launcher.epicgames.com/api/v2/user/account",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = userResponse.data;
    console.log("User info received:", { account_id: userData.account_id, name: userData.name });

    // Store linked account for multi-provider support
    await addLinkedAccount({
      provider: "epic",
      providerId: userData.account_id,
      name: userData.name,
      image: userData.picture,
      accessToken: access_token,
    });
    console.log("Linked account stored");

    // Store user data in cookie to be picked up by CredentialsProvider
    const epicUserData = {
      id: userData.account_id,
      name: userData.name,
      email: userData.email,
      image: userData.picture,
      accessToken: access_token,
      refreshToken: refresh_token,
      provider: "epic",
    };

    // Create response with redirect to signin page
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: "/epic-signin",
        "Set-Cookie": `epic-user=${JSON.stringify(epicUserData)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
      },
    });

    return response;
  } catch (error) {
    console.error("Epic OAuth callback error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    
    // Log full error details for debugging
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Epic API response status:", axiosError.response?.status);
      console.error("Epic API response data:", axiosError.response?.data);
    }
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/?error=epic_auth_failed&details=${encodeURIComponent(errorMessage)}`,
      },
    });
  }
}
