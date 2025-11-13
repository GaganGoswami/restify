// HTTP request type definitions
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type ParamType = "query" | "header" | "path" | "body";

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface RequestBody {
  type: "none" | "json" | "xml" | "form-data" | "form-urlencoded" | "raw" | "binary" | "graphql";
  content: string;
  formData?: KeyValuePair[];
  binaryFile?: File;
}

export interface Request {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body: RequestBody;
  auth?: AuthConfig;
  preRequestScript?: string;
  tests?: string;
  collectionId?: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestExecution {
  request: Request;
  environment?: string;
  resolvedUrl: string;
  resolvedHeaders: KeyValuePair[];
  resolvedBody: RequestBody;
  timestamp: Date;
}

// Authentication types
export type AuthType = "none" | "basic" | "bearer" | "api-key" | "oauth2";

export interface BasicAuth {
  type: "basic";
  username: string;
  password: string;
}

export interface BearerAuth {
  type: "bearer";
  token: string;
}

export interface ApiKeyAuth {
  type: "api-key";
  key: string;
  value: string;
  addTo: "header" | "query";
}

export interface OAuth2Config {
  type: "oauth2";
  grantType: "authorization_code" | "client_credentials" | "password" | "implicit";
  accessTokenUrl?: string;
  authorizationUrl?: string;
  clientId: string;
  clientSecret?: string;
  scope?: string;
  redirectUri?: string;
  username?: string;
  password?: string;
}

export type AuthConfig = { type: "none" } | BasicAuth | BearerAuth | ApiKeyAuth | OAuth2Config;

// HTTP response types
export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  timestamp: Date;
}

export interface ResponseError {
  message: string;
  code?: string;
  timestamp: Date;
}
