"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Game } from "@/lib/gameProviders";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchGames();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          <p className="text-slate-600">Loading your games...</p>
        </div>
      </div>
    );
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform =
      !selectedPlatform || game.platform === selectedPlatform;
    const matchesCategory =
      !selectedCategory || game.categories?.includes(selectedCategory);
    const matchesTag =
      !selectedTag || game.tags?.includes(selectedTag);
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
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {games.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Platforms</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {platforms.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Unique Games</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {filteredGames.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div>
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

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-slate-900">
              Filter by Platform
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedPlatform === null
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                }`}
              >
                All Platforms
              </button>
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedPlatform === platform
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-900">
                Filter by Category
              </label>
              <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-slate-900">
                Filter by Genre/Tag
              </label>
              <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTag === null
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                  }`}
                >
                  All Genres
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
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
