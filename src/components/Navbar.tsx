"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!session) {
    return null;
  }

  // Determine connected providers based on session data
  // Since we're using Steam authentication, we know Steam is connected
  const connectedProviders = ["Steam"];

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">DoIOwnIt</h1>
              <p className="text-sm text-slate-600">Your unified game library</p>
            </div>
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100"
            >
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">
                  {session.user?.name}
                </p>
                <p className="text-xs text-slate-500">{session.user?.email}</p>
              </div>
              <svg
                className={`h-5 w-5 text-slate-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  {/* User Info */}
                  <div className="mb-4 flex items-center gap-3 pb-4 border-b border-slate-200">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {session.user?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Connected Providers */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-700 uppercase tracking-wider mb-2">
                      Connected Providers
                    </p>
                    <div className="space-y-2">
                      {connectedProviders.map((provider) => (
                        <div
                          key={provider}
                          className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2"
                        >
                          {provider === "Steam" && (
                            <svg
                              className="h-5 w-5 text-slate-700"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.066 3.331-1.363.261-.628.198-1.337-.145-1.979-.342-.643-.939-1.136-1.567-1.397-.628-.261-1.289-.212-1.877.063l1.525.631c.956.396 1.415 1.5 1.019 2.456-.396.957-1.5 1.415-2.456 1.02l.329-.071zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
                            </svg>
                          )}
                          <span className="text-sm font-medium text-slate-700">
                            {provider}
                          </span>
                          <span className="ml-auto">
                            <svg
                              className="h-4 w-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut({ redirectTo: "/auth/signin" });
                    }}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
