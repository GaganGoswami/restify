"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Collection, Request } from "@/types";

interface CollectionSearchProps {
  collections: Collection[];
  requests: Request[];
  onResultClick?: (item: SearchResult) => void;
}

interface SearchResult {
  type: "collection" | "folder" | "request";
  id: string;
  name: string;
  collectionName?: string;
  folderName?: string;
  method?: string;
}

export function CollectionSearch({ collections, requests, onResultClick }: CollectionSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Search across collections, folders, and requests
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search collections
    collections.forEach((collection) => {
      if (collection.name.toLowerCase().includes(searchTerm)) {
        results.push({
          type: "collection",
          id: collection.id,
          name: collection.name,
        });
      }

      // Search folders in this collection
      collection.folders.forEach((folder) => {
        if (folder.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: "folder",
            id: folder.id,
            name: folder.name,
            collectionName: collection.name,
          });
        }
      });
    });

    // Search requests
    requests.forEach((request) => {
      if (
        request.name.toLowerCase().includes(searchTerm) ||
        request.url.toLowerCase().includes(searchTerm)
      ) {
        const collection = collections.find((c) => c.id === request.collectionId);
        const folder = collection?.folders.find((f) => f.id === request.folderId);

        results.push({
          type: "request",
          id: request.id,
          name: request.name,
          method: request.method,
          collectionName: collection?.name,
          folderName: folder?.name,
        });
      }
    });

    return results.slice(0, 20); // Limit to 20 results
  }, [query, collections, requests]);

  const handleClear = () => {
    setQuery("");
    setIsFocused(false);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    handleClear();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-8 pr-8"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && results.length > 0 && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsFocused(false)} />

          {/* Results */}
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                className="flex w-full flex-col items-start gap-1 border-b p-3 text-left hover:bg-accent last:border-0"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-2">
                  {result.type === "request" && result.method && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        result.method === "GET"
                          ? "bg-green-500/10 text-green-500"
                          : result.method === "POST"
                            ? "bg-blue-500/10 text-blue-500"
                            : result.method === "PUT"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : result.method === "DELETE"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {result.method}
                    </span>
                  )}
                  <span className="font-medium">{result.name}</span>
                </div>
                {(result.collectionName || result.folderName) && (
                  <span className="text-xs text-muted-foreground">
                    {[result.collectionName, result.folderName].filter(Boolean).join(" / ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
