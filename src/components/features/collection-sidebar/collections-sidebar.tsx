"use client";

import { useState } from "react";
import { ChevronRight, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCollections } from "@/hooks/use-collections";
import { CollectionNode } from "./collection-node";
import { NewCollectionDialog } from "./new-collection-dialog";
import { ImportDialog } from "@/components/features/import/import-dialog";
import { useQueryClient } from "@tanstack/react-query";

export function CollectionsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { collections } = useCollections();
  const queryClient = useQueryClient();

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  // Filter collections based on search
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNewCollectionDialog(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New Collection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={() => setShowImportDialog(true)}>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Import Collection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Collections Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {!isCollapsed && (
            <>
              {filteredCollections.length === 0 && !searchQuery ? (
                <div className="text-sm text-muted-foreground">
                  No collections yet. Create one to organize your requests.
                </div>
              ) : filteredCollections.length === 0 && searchQuery ? (
                <div className="text-sm text-muted-foreground">
                  No collections match &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCollections.map((collection) => (
                    <CollectionNode key={collection.id} collection={collection} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NewCollectionDialog
        open={showNewCollectionDialog}
        onOpenChange={setShowNewCollectionDialog}
        onCreate={() => {
          handleRefetch();
        }}
      />

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={() => {
          handleRefetch();
        }}
      />
    </>
  );
}
