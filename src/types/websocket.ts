// WebSocket type definitions
export type WebSocketState = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketConnection {
  id: string;
  name: string;
  url: string;
  state: WebSocketState;
  messages: WebSocketMessage[];
  protocols?: string[];
  headers?: import("./request").KeyValuePair[];
  createdAt: Date;
  connectedAt?: Date;
  disconnectedAt?: Date;
}

export interface WebSocketMessage {
  id: string;
  connectionId: string;
  type: "sent" | "received";
  content: string;
  timestamp: Date;
  format?: "text" | "json" | "binary";
}

export interface WebSocketOptions {
  protocols?: string[];
  headers?: Record<string, string>;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
