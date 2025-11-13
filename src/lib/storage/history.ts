import { db } from "@/lib/db";
import type { HistoryEntry, HistoryFilter, HistoryStats } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Create a history entry
export async function createHistoryEntry(
  data: Omit<HistoryEntry, "id" | "timestamp">
): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    ...data,
    id: uuidv4(),
    timestamp: new Date(),
  };

  await db.history.add(entry);

  // Clean up old entries if exceeding max
  const settings = await db.settings.get("default");
  if (settings) {
    const count = await db.history.count();
    if (count > settings.maxHistoryEntries) {
      const excess = count - settings.maxHistoryEntries;
      const oldestEntries = await db.history.orderBy("timestamp").limit(excess).toArray();
      const oldestIds = oldestEntries.map((e) => e.id);
      await db.history.bulkDelete(oldestIds);
    }
  }

  return entry;
}

// Get a history entry by ID
export async function getHistoryEntry(id: string): Promise<HistoryEntry | undefined> {
  return db.history.get(id);
}

// Get all history entries (most recent first)
export async function getAllHistory(limit?: number): Promise<HistoryEntry[]> {
  let query = db.history.orderBy("timestamp").reverse();
  if (limit) {
    query = query.limit(limit);
  }
  return query.toArray();
}

// Get filtered history
export async function getFilteredHistory(filter: HistoryFilter): Promise<HistoryEntry[]> {
  let query = db.history.toCollection();

  if (filter.method) {
    query = query.filter((entry) => entry.method === filter.method);
  }

  if (filter.status !== undefined) {
    query = query.filter((entry) => entry.status === filter.status);
  }

  if (filter.dateFrom || filter.dateTo) {
    query = query.filter((entry) => {
      if (filter.dateFrom && entry.timestamp < filter.dateFrom) return false;
      if (filter.dateTo && entry.timestamp > filter.dateTo) return false;
      return true;
    });
  }

  if (filter.searchQuery) {
    const lowerQuery = filter.searchQuery.toLowerCase();
    query = query.filter((entry) => entry.url.toLowerCase().includes(lowerQuery));
  }

  return query.reverse().sortBy("timestamp");
}

// Get history stats
export async function getHistoryStats(): Promise<HistoryStats> {
  const entries = await db.history.toArray();

  const totalRequests = entries.length;
  const successfulRequests = entries.filter(
    (e) => e.status && e.status >= 200 && e.status < 300
  ).length;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

  const durations = entries.filter((e) => e.duration !== undefined).map((e) => e.duration!);
  const averageDuration =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  const methodDistribution: Record<string, number> = {};
  entries.forEach((e) => {
    methodDistribution[e.method] = (methodDistribution[e.method] || 0) + 1;
  });

  const statusDistribution: Record<number, number> = {};
  entries.forEach((e) => {
    if (e.status) {
      statusDistribution[e.status] = (statusDistribution[e.status] || 0) + 1;
    }
  });

  return {
    totalRequests,
    successRate,
    averageDuration,
    methodDistribution,
    statusDistribution,
  };
}

// Clear all history
export async function clearHistory(): Promise<void> {
  await db.history.clear();
}

// Delete a history entry
export async function deleteHistoryEntry(id: string): Promise<void> {
  await db.history.delete(id);
}

// Delete history entries older than a date
export async function deleteHistoryBefore(date: Date): Promise<void> {
  await db.history.where("timestamp").below(date).delete();
}
