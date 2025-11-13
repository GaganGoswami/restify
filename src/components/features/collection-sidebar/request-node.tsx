"use client";

import { MoreVertical } from "lucide-react";
import type { Request } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RequestNodeProps {
  request: Request;
  depth?: number;
  onSelect?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMove?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-600 bg-green-100 dark:bg-green-900/30",
  POST: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  PUT: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  PATCH: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  DELETE: "text-red-600 bg-red-100 dark:bg-red-900/30",
  HEAD: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  OPTIONS: "text-gray-600 bg-gray-100 dark:bg-gray-900/30",
};

export function RequestNode({
  request,
  depth = 0,
  onSelect,
  onDuplicate,
  onMove,
  onDelete,
}: RequestNodeProps) {
  return (
    <div
      className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      onClick={() => onSelect?.(request.id)}
    >
      {/* Method Badge */}
      <span
        className={`px-1.5 py-0.5 text-xs font-medium rounded ${
          METHOD_COLORS[request.method] || METHOD_COLORS.GET
        }`}
      >
        {request.method}
      </span>

      {/* Request Name */}
      <span className="flex-1 truncate text-sm">{request.name}</span>

      {/* Context Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(request.id);
            }}
          >
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate?.(request.id);
            }}
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMove?.(request.id);
            }}
          >
            Move to Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(request.id);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
