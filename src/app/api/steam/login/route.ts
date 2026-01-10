import { NextResponse } from "next/server";
import { getBaseUrl } from "@/auth";

// Steam OpenID login initiation
export async function GET() {
  const baseUrl = getBaseUrl();
  const returnUrl = `${baseUrl}/api/steam/callback`;
  const realm = baseUrl;
  
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  
  const steamLoginUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;
  
  return NextResponse.redirect(steamLoginUrl);
}
