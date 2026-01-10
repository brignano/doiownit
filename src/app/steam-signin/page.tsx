"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SteamSignInPage() {
  useEffect(() => {
    // Automatically trigger sign-in when page loads
    // This will use the steam-user cookie set by the Steam callback
    signIn("steam", { callbackUrl: "/dashboard", redirect: true });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 mx-auto" />
        <p className="text-slate-600">Completing Steam sign-in...</p>
      </div>
    </div>
  );
}
