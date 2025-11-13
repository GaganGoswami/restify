"use client";

import { useState } from "react";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Collection, Request } from "@/types";

interface SaveToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Request;
  collections: Collection[];
  onSave: (collectionId: string, folderId?: string, requestName?: string) => void;
}

export function SaveToCollectionDialog({
  open,
  onOpenChange,
  request,
  collections,
  onSave,
}: SaveToCollectionDialogProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [requestName, setRequestName] = useState(request.name);

  const handleSave = () => {
    if (selectedCollectionId) {
      onSave(selectedCollectionId, selectedFolderId || undefined, requestName.trim() || undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
          <DialogDescription>Choose where to save this request.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Request Name */}
          <div className="space-y-2">
            <label htmlFor="requestName" className="text-sm font-medium">
              Request Name
            </label>
            <Input
              id="requestName"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Enter request name"
            />
          </div>

          {/* Collection Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Collection</label>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
              {collections.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No collections available. Create one first.
                </div>
              ) : (
                collections.map((collection) => (
                  <div key={collection.id}>
                    <button
                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${
                        selectedCollectionId === collection.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        setSelectedCollectionId(collection.id);
                        setSelectedFolderId(null);
                      }}
                    >
                      <Folder className="h-4 w-4" />
                      {collection.name}
                    </button>
                    {/* TODO: Render folders if collection is selected */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedCollectionId || !requestName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
