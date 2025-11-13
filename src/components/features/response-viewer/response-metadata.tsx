"use client";

import { cn } from "@/lib/utils/cn";

interface ResponseMetadataProps {
  status: number;
  statusText: string;
  time: number;
  size: number;
}

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300)
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
  if (status >= 300 && status < 400)
    return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
  if (status >= 400 && status < 500)
    return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
};

export function ResponseMetadata({ status, statusText, time, size }: ResponseMetadataProps) {
  const sizeInKB = (size / 1024).toFixed(2);

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/50">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm",
          getStatusColor(status)
        )}
      >
        <span>{status}</span>
        <span>{statusText}</span>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Time:</span>
        <span className="font-medium">{time}ms</span>
      </div>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">Size:</span>
        <span className="font-medium">{sizeInKB} KB</span>
      </div>
    </div>
  );
}
