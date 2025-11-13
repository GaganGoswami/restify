"use client";

import { useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CollectionsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      className={`flex flex-col border-r bg-muted/10 transition-all duration-200 ${
        isCollapsed ? "w-12" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2">
        {!isCollapsed && (
          <>
            <h2 className="text-sm font-semibold">Collections</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Open new collection dialog
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Collection</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={isCollapsed ? "w-full" : ""}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
          />
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      {/* Collections Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isCollapsed && (
          <div className="text-sm text-muted-foreground">
            No collections yet. Create one to organize your requests.
          </div>
        )}
      </div>
    </div>
  );
}
