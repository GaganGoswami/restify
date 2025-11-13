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
import { importOpenAPISpec } from "@/lib/importers/openapi-importer";
import { importCurlCommand } from "@/lib/importers/curl-importer";
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

      // Validate JSON format first
      try {
        JSON.parse(content);
      } catch {
        throw new Error("Invalid JSON format. Please check your file.");
      }

      if (format === "postman") {
        // Validate before import
        const parsed = JSON.parse(content);
        if (!parsed.info || !parsed.info.name) {
          throw new Error("Invalid Postman collection: missing collection name");
        }
        if (
          !parsed.info.schema ||
          (!parsed.info.schema.includes("v2.1") && !parsed.info.schema.includes("v2.0"))
        ) {
          throw new Error("Only Postman Collection v2.0 and v2.1 are supported");
        }

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
        // Validate OpenAPI spec
        const parsed = JSON.parse(content);
        if (!parsed.openapi) {
          throw new Error("Invalid OpenAPI specification: missing 'openapi' field");
        }
        if (!parsed.openapi.startsWith("3.")) {
          throw new Error("Only OpenAPI 3.x specifications are supported");
        }
        if (!parsed.info || !parsed.info.title) {
          throw new Error("Invalid OpenAPI specification: missing 'info.title'");
        }

        const { collection, requests, folders } = await importOpenAPISpec(content);

        // Save to database
        await db.collections.add(collection);
        await db.folders.bulkAdd(folders);
        await db.requests.bulkAdd(requests);

        onImportComplete?.();
        onOpenChange(false);

        // Reset state
        setFile(null);
        setFormat("postman");
      } else if (format === "curl") {
        // Validate cURL command
        if (!content.trim().startsWith("curl")) {
          throw new Error("Invalid cURL command: must start with 'curl'");
        }
        if (!content.includes("http://") && !content.includes("https://")) {
          throw new Error("Invalid cURL command: missing URL");
        }

        const request = await importCurlCommand(content);

        // Save single request to database
        await db.requests.add(request);

        onImportComplete?.();
        onOpenChange(false);

        // Reset state
        setFile(null);
        setFormat("postman");
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
