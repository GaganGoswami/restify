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

interface CollectionNodeProps {
  collection: Collection;
  onRename?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onExport?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function CollectionNode({
  collection,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
  onSelect,
}: CollectionNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="select-none">
      {/* Collection Header */}
      <div
        className="group flex items-center gap-1 rounded px-2 py-1.5 hover:bg-accent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <Folder className="h-4 w-4 text-blue-500" />
        <span
          className="flex-1 truncate text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(collection.id);
          }}
        >
          {collection.name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename?.(collection.id)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(collection.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.(collection.id)}>Export</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(collection.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collection Children */}
      {isExpanded && (
        <div className="ml-4">
          {/* TODO: Render folders and requests */}
          {collection.folders?.length === 0 && collection.requests?.length === 0 && (
            <div className="py-2 text-xs text-muted-foreground">No requests yet</div>
          )}
        </div>
      )}
    </div>
  );
}
