"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
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
import { importPostmanCollection } from "@/lib/importers/postman-importer";
import { db } from "@/lib/db";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

type ImportFormat = "postman" | "openapi" | "curl";

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [format, setFormat] = useState<ImportFormat>("postman");
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const content = await file.text();

      if (format === "postman") {
        const { collection, requests, folders } = await importPostmanCollection(content);

        // Save to database
        await db.collections.add(collection);
        await db.folders.bulkAdd(folders);
        await db.requests.bulkAdd(requests);

        onImportComplete?.();
        onOpenChange(false);

        // Reset state
        setFile(null);
        setFormat("postman");
      } else if (format === "openapi") {
        setError("OpenAPI import is not yet implemented");
      } else if (format === "curl") {
        setError("cURL import is not yet implemented");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import collection");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Collection</DialogTitle>
          <DialogDescription>
            Import a collection from Postman, OpenAPI, or cURL format
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selection */}
          <div className="grid gap-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ImportFormat)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postman">Postman (v2.1/v2.0)</SelectItem>
                <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
                <SelectItem value="curl">cURL Command</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Choose file"}
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
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
              setFile(null);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
