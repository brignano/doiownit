"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
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
            onClick={() => signIn("steam", { redirectTo: "/dashboard" })}
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
            onClick={() => signIn("epic", { redirectTo: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-linear-to-r from-purple-600 to-purple-700 px-4 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-purple-800"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7v7c0 5.25 3 10 10 11 7-1 10-5.75 10-11V7l-10-5z" />
            </svg>
            Sign in with Epic Games
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
