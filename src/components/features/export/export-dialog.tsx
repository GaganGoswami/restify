"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportPostmanCollection } from "@/lib/exporters/postman-exporter";
import type { Collection, Folder, Request } from "@/types";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection;
  requests: Request[];
  folders: Folder[];
}

type ExportFormat = "postman" | "openapi" | "json";

export function ExportDialog({
  open,
  onOpenChange,
  collection,
  requests,
  folders,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("postman");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setError(null);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "postman") {
        content = exportPostmanCollection(collection, requests, folders);
        filename = `${collection.name.replace(/[^a-z0-9]/gi, "_")}.postman_collection.json`;
        mimeType = "application/json";
      } else if (format === "openapi") {
        setError("OpenAPI export is not yet implemented");
        setIsExporting(false);
        return;
      } else {
        // JSON export
        content = JSON.stringify(
          {
            collection,
            requests,
            folders,
          },
          null,
          2
        );
        filename = `${collection.name.replace(/[^a-z0-9]/gi, "_")}.json`;
        mimeType = "application/json";
      }

      // Create blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export collection");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Collection</DialogTitle>
          <DialogDescription>
            Export &ldquo;{collection.name}&rdquo; to Postman, OpenAPI, or JSON format
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selection */}
          <div className="grid gap-2">
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postman">Postman (v2.1)</SelectItem>
                <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                <SelectItem value="json">JSON (Restify format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Message */}
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <p>
              Collection will be downloaded as:{" "}
              <span className="font-mono">
                {collection.name.replace(/[^a-z0-9]/gi, "_")}
                {format === "postman" ? ".postman_collection" : ""}.json
              </span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
