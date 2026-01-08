import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

// Custom GET handler to process Steam callbacks
export async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;
  const path = params.nextauth.join("/");
  
  // Check if this is a Steam callback
  if (path === "callback/steam") {
    // Trigger sign-in with credentials provider
    // The credentials provider will read from the steam-user cookie
    try {
      await signIn("steam", { redirect: false });
      // Redirect to home page after successful sign-in
      return NextResponse.redirect(new URL("/", req.url));
    } catch (error) {
      console.error("Steam sign-in error:", error);
      return NextResponse.redirect(new URL("/?error=SignInFailed", req.url));
    }
  }
  
  // For all other paths, use default handler
  return handlers.GET(req, context);
}

export const { POST } = handlers;
