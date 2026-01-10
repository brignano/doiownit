"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface LinkedAccount {
  provider: string;
  providerId: string;
  name: string;
  image?: string;
}

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const isLinking = searchParams.get("linking") === "true";

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      if (session) {
        try {
          const res = await fetch("/api/linked-accounts");
          if (res.ok) {
            const data = await res.json();
            setLinkedAccounts(data.accounts);
            // Only redirect to dashboard if not in linking mode and user has accounts
            if (data.accounts.length > 0 && !isLinking) {
              router.push("/dashboard");
              return;
            }
          }
        } catch (error) {
          console.error("Failed to fetch linked accounts:", error);
        }
      }
      setLoading(false);
    };

    fetchLinkedAccounts();
  }, [session, router, isLinking]);

  const handleSteamLogin = () => {
    router.push("/api/steam/login");
  };

  const handleEpicLogin = () => {
    router.push("/api/epic/login");
  };

  const isSteamLinked = linkedAccounts.some(acc => acc.provider === "steam");
  const isEpicLinked = linkedAccounts.some(acc => acc.provider === "epic");
  const isEpicConfigured = process.env.NEXT_PUBLIC_EPIC_CONFIGURED === "true";

  if (session && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-white">Loading accounts...</div>
      </div>
    );
  }

  if (session && linkedAccounts.length > 0) {
    // User is logged in and has linked accounts
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">DoIOwnIt</h1>
            <p className="mt-2 text-slate-600">Welcome back!</p>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Linked Accounts
            </h2>
            <div className="space-y-2 rounded-lg bg-slate-50 p-4">
              {linkedAccounts.map((account) => (
                <div
                  key={`${account.provider}-${account.providerId}`}
                  className="flex items-center gap-3 rounded-lg bg-white p-3"
                >
                  {account.provider === "steam" && (
                    <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-white"
                        viewBox="0 0 32 32"
                        fill="currentColor"
                      >
                        <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12zm6-12c0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6 6-2.7 6-6z" />
                      </svg>
                    </div>
                  )}
                  {account.provider === "epic" && (
                    <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 7v7c0 5.25 3 10 10 11 7-1 10-5.75 10-11V7l-10-5z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 capitalize">
                      {account.provider}
                    </p>
                    <p className="text-xs text-slate-500">{account.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(!isSteamLinked || (!isEpicLinked && isEpicConfigured)) && (
            <div className="mt-8">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                Link Additional Accounts
              </h2>
              <div className="space-y-3">
                {!isSteamLinked && (
                  <button
                    onClick={handleSteamLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white transition-colors hover:from-blue-700 hover:to-blue-800"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12zm6-12c0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6 6-2.7 6-6z" />
                    </svg>
                    Link Steam
                  </button>
                )}

                {!isEpicLinked && (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-400 px-4 py-3 font-medium text-white cursor-not-allowed opacity-75"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L2 7v7c0 5.25 3 10 10 11 7-1 10-5.75 10-11V7l-10-5z" />
                    </svg>
                    Link Epic Games (Coming Soon)
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User not logged in or no linked accounts
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">DoIOwnIt</h1>
          <p className="mt-2 text-slate-600">
            Aggregate all your game libraries in one place
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleSteamLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white transition-colors hover:from-blue-700 hover:to-blue-800"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 26c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12zm6-12c0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6 6-2.7 6-6z" />
            </svg>
            Sign in with Steam
          </button>

          <button
            disabled
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-400 px-4 py-3 font-medium text-white cursor-not-allowed opacity-75"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7v7c0 5.25 3 10 10 11 7-1 10-5.75 10-11V7l-10-5z" />
            </svg>
            Epic Games (Coming Soon)
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                More platforms coming soon
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600">
            Coming soon: GOG, PlayStation Network, Xbox Game Pass
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
