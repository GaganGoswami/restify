// History type definitions
export interface HistoryEntry {
  id: string;
  requestId?: string;
  method: import("./request").HttpMethod;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  timestamp: Date;
  request: import("./request").Request;
  response?: import("./request").HttpResponse;
  error?: import("./request").ResponseError;
}

export interface HistoryFilter {
  method?: import("./request").HttpMethod;
  status?: number;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

export interface HistoryStats {
  totalRequests: number;
  successRate: number;
  averageDuration: number;
  methodDistribution: Record<string, number>;
  statusDistribution: Record<number, number>;
}
