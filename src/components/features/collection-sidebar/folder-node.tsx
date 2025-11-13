"use client";

import { useState } from "react";
import { ChevronRight, Folder, MoreVertical } from "lucide-react";
import type { Folder as FolderType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FolderNodeProps {
  folder: FolderType;
  depth?: number;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function FolderNode({ folder, depth = 0, onRename, onDelete, onSelect }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const maxDepth = 3;

  return (
    <div className="select-none">
      {/* Folder Header */}
      <div
        className="group flex items-center gap-1 rounded px-2 py-1.5 hover:bg-accent"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <Folder className="h-4 w-4 text-yellow-500" />
        <span
          className="flex-1 truncate text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(folder.id);
          }}
        >
          {folder.name}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename?.(folder.id)}>Rename</DropdownMenuItem>
            {depth < maxDepth - 1 && (
              <DropdownMenuItem
                onClick={() => {
                  /* TODO: Add subfolder */
                }}
              >
                Add Subfolder
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(folder.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Folder Children */}
      {isExpanded && (
        <div>
          {/* TODO: Render subfolders and requests */}
          {(!folder.requests || folder.requests.length === 0) && (
            <div
              className="py-2 text-xs text-muted-foreground"
              style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
            >
              No requests yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
