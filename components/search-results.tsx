"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BlogFeed } from "@/components/blog-feed";


export function SearchResults({ initialPosts = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const searchPosts = useCallback(async (q: string, cursor?: string) => {
    if (!q.trim()) {
      setResults(initialPosts);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        limit: "10",
        status: "PUBLISHED",
      });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/v1/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(cursor ? (prev: Post[]) => [...prev, ...data.posts] : data.posts);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [initialPosts]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchPosts(query);
      } else if (!query.trim()) {
        setResults(initialPosts);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchPosts, initialPosts]);

  const loadMore = async () => {
    if (loading || !hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: "10",
        status: "PUBLISHED",
        cursor: nextCursor,
      });
      const res = await fetch(`/api/v1/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults((prev) => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Search load more error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {hasSearched && query.trim().length < 2 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Type at least 2 characters to search
        </p>
      )}

      <BlogFeed initialPosts={results} />

      {hasSearched && hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more results"}
          </button>
        </div>
      )}

      {hasSearched && results.length === 0 && query.trim().length >= 2 && (
        <div className="text-center py-12 text-muted-foreground">
          <SearchIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg">No posts found for "{query}"</p>
          <p className="text-sm">Try different keywords or browse all posts</p>
        </div>
      )}
    </div>
  );
}