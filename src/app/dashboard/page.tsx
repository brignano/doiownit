"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Game } from "@/lib/gameProviders";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Dropdown open/close states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        platformDropdownRef.current && !platformDropdownRef.current.contains(target) &&
        categoryDropdownRef.current && !categoryDropdownRef.current.contains(target) &&
        tagDropdownRef.current && !tagDropdownRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const data = await response.json();
          setGames(data.games);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoadingGames(false);
      }
    };

    if (status === "authenticated") {
      fetchGames();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          <p className="text-slate-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform =
      selectedPlatforms.length === 0 || selectedPlatforms.includes(game.platform);
    const matchesCategory =
      selectedCategories.length === 0 || 
      game.categories?.some((cat) => selectedCategories.includes(cat));
    const matchesTag =
      selectedTags.length === 0 || 
      game.tags?.some((tag) => selectedTags.includes(tag));
    return matchesSearch && matchesPlatform && matchesCategory && matchesTag;
  });

  const platforms = Array.from(new Set(games.map((game) => game.platform)));
  const categories = Array.from(
    new Set(games.flatMap((game) => game.categories || []))
  ).sort();
  const tags = Array.from(
    new Set(games.flatMap((game) => game.tags || []))
  ).sort();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Games</p>
            <div className="mt-2 flex items-center gap-3">
              {loadingGames ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <span className="text-sm text-slate-500">Loading...</span>
                </>
              ) : (
                <p className="text-3xl font-bold text-slate-900">
                  {games.length}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Platforms</p>
            <div className="mt-2 flex items-center gap-3">
              {loadingGames ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <span className="text-sm text-slate-500">Loading...</span>
                </>
              ) : (
                <p className="text-3xl font-bold text-slate-900">
                  {platforms.length}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Unique Games</p>
            <div className="mt-2 flex items-center gap-3">
              {loadingGames ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <span className="text-sm text-slate-500">Loading...</span>
                </>
              ) : (
                <p className="text-3xl font-bold text-slate-900">
                  {filteredGames.length}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-slate-900">
                Search Games
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by game name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            {(searchTerm || selectedPlatforms.length > 0 || selectedCategories.length > 0 || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPlatforms([]);
                  setSelectedCategories([]);
                  setSelectedTags([]);
                }}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-300"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Platform Filter */}
            <div ref={platformDropdownRef} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "platform" ? null : "platform")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <div className="flex items-center justify-between">
                  <span>Platforms {selectedPlatforms.length > 0 && `(${selectedPlatforms.length})`}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${openDropdown === "platform" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {openDropdown === "platform" && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-300 bg-white shadow-lg">
                  <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                    {platforms.map((platform) => (
                      <label key={platform} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlatforms([...selectedPlatforms, platform]);
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-900">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPlatforms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPlatforms.map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-900"
                    >
                      {platform}
                      <button
                        onClick={() =>
                          setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
                        }
                        className="font-bold hover:text-slate-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div ref={categoryDropdownRef} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <div className="flex items-center justify-between">
                    <span>Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {openDropdown === "category" && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-300 bg-white shadow-lg">
                    <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter((c) => c !== category));
                              }
                            }}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-900">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-200 px-3 py-1 text-sm text-blue-900"
                      >
                        {category}
                        <button
                          onClick={() =>
                            setSelectedCategories(selectedCategories.filter((c) => c !== category))
                          }
                          className="font-bold hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tag/Genre Filter */}
            {tags.length > 0 && (
              <div ref={tagDropdownRef} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === "tag" ? null : "tag")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <div className="flex items-center justify-between">
                    <span>Genres {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${openDropdown === "tag" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {openDropdown === "tag" && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-300 bg-white shadow-lg">
                    <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                      {tags.map((tag) => (
                        <label key={tag} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag]);
                              } else {
                                setSelectedTags(selectedTags.filter((t) => t !== tag));
                              }
                            }}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-900">{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-200 px-3 py-1 text-sm text-purple-900"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setSelectedTags(selectedTags.filter((t) => t !== tag))
                          }
                          className="font-bold hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Games Grid */}
        {loadingGames ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              <p className="text-sm text-slate-600">Fetching your games from Steam...</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <div className="relative h-40 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {game.image && (
                  <div className="relative h-40 w-full bg-slate-200">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">
                    {game.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{game.platform}</p>
                  {game.playtimeMinutes && (
                    <p className="mt-1 text-xs text-slate-500">
                      {Math.round(game.playtimeMinutes / 60)} hours played
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-slate-600">
              {games.length === 0
                ? "No games found. Try connecting more game platforms."
                : "No games match your search. Try different keywords."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
