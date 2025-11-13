"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { queryClient } from "@/lib/utils/query-client";
import { initializeDatabase } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize IndexedDB on mount
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
