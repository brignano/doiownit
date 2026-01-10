import { getBaseUrl } from "@/auth";

export async function GET() {
  const baseUrl = getBaseUrl();
  const clientId = process.env.EPIC_CLIENT_ID;

  if (!clientId) {
    return Response.json(
      { error: "Epic Games Client ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/epic/callback`;
  const state = Math.random().toString(36).substring(7);

  // Store state in a secure cookie for validation on callback
  const response = new Response(
    null,
    {
      status: 302,
      headers: {
        Location: `https://launcher.epicgames.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
        "Set-Cookie": `epic-oauth-state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    }
  );

  return response;
}
