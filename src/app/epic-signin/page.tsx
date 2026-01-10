"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EpicSignIn() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically sign in when this page loads
    // The cookie will be read by the CredentialsProvider
    const performSignIn = async () => {
      try {
        const result = await signIn("epic", { redirect: false });
        if (result?.ok) {
          // Check if user already has a session (linking mode)
          if (session) {
            router.push("/auth/signin?linking=true");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError("Failed to sign in with Epic Games");
        }
      } catch (err) {
        console.error("Sign in error:", err);
        setError("An error occurred during sign in");
      }
    };

    performSignIn();
  }, [router, session]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Signing in with Epic Games...</h1>
        <p className="mt-2 text-slate-300">
          Please wait while we authenticate your account.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
