"use client";

import { useState } from "react";
import { ChevronRight, Folder, MoreVertical } from "lucide-react";
import type { Collection } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollections } from "@/hooks/use-collections";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ExportDialog } from "@/components/features/export/export-dialog";
import { FolderNode } from "./folder-node";
import { RequestNode } from "./request-node";

interface CollectionNodeProps {
  collection: Collection;
}

export function CollectionNode({ collection }: CollectionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { delete: deleteCollection, duplicate, rename } = useCollections();

  // Fetch full data for export
  const requests = useLiveQuery(
    () => db.requests.where("collectionId").equals(collection.id).toArray(),
    [collection.id]
  );

  const folders = collection.folders || [];

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      await deleteCollection(collection.id);
    }
  };

  const handleDuplicate = async () => {
    await duplicate(collection.id);
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", collection.name);
    if (newName && newName !== collection.name) {
      await rename({ id: collection.id, name: newName });
    }
  };

  // Get root-level folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentFolderId);

  // Get root-level requests (not in any folder)
  const rootRequests = (requests || []).filter((r) => !r.folderId);

  return (
    <>
      <div className="select-none">
        {/* Collection Header */}
        <div
          className="group flex items-center gap-1 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
          <Folder className="h-4 w-4 text-blue-500" />
          <span className="flex-1 truncate text-sm">{collection.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRename}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportDialog(true)}>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collection Children */}
        {isExpanded && (
          <div className="ml-4">
            {/* Render root folders */}
            {rootFolders.map((folder) => (
              <FolderNode key={folder.id} folder={folder} depth={0} />
            ))}

            {/* Render root requests */}
            {rootRequests.map((request) => (
              <RequestNode key={request.id} request={request} depth={0} />
            ))}

            {rootFolders.length === 0 && rootRequests.length === 0 && (
              <div className="py-2 text-xs text-muted-foreground">No requests yet</div>
            )}
          </div>
        )}
      </div>

      {/* Export Dialog */}
      {showExportDialog && requests && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          collection={collection}
          requests={requests}
          folders={folders}
        />
      )}
    </>
  );
}
