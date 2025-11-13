"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { JsonEditor } from "../request-builder/json-editor";
import { formatResponseBody, getContentType } from "@/lib/http/client";

interface ResponseBodyProps {
  body: string;
  headers: Record<string, string>;
}

export function ResponseBody({ body, headers }: ResponseBodyProps) {
  const [copied, setCopied] = useState(false);
  const contentType = getContentType(headers);
  const isJson = contentType?.includes("application/json");

  const formattedBody = formatResponseBody(body, contentType);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedBody], { type: contentType || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${Date.now()}.${isJson ? "json" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!body) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No response body
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-sm text-muted-foreground">
          {contentType || "text/plain"} • {(new Blob([body]).size / 1024).toFixed(2)} KB
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isJson ? (
          <JsonEditor value={formattedBody} onChange={() => {}} readOnly height="100%" />
        ) : (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words">{formattedBody}</pre>
        )}
      </div>
    </div>
  );
}
