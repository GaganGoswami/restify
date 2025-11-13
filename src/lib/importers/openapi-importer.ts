import { v4 as uuidv4 } from "uuid";
import type { Collection, Folder, Request, RequestBody } from "@/types";

// OpenAPI 3.0 format types
interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: PathItem;
  };
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  options?: Operation;
  head?: Operation;
  trace?: Operation;
  parameters?: Parameter[];
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBodySpec;
  responses?: Record<string, unknown>;
}

interface Parameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: {
    type: string;
    default?: unknown;
  };
}

interface RequestBodySpec {
  description?: string;
  required?: boolean;
  content?: {
    [mediaType: string]: {
      schema?: unknown;
      example?: unknown;
    };
  };
}

/**
 * Import an OpenAPI 3.0 specification and convert to Restify format
 * @param jsonContent - The JSON content of the OpenAPI spec
 * @returns Object containing collection metadata, requests array, and folders array
 */
export async function importOpenAPISpec(
  jsonContent: string
): Promise<{ collection: Collection; requests: Request[]; folders: Folder[] }> {
  try {
    const spec: OpenAPISpec = JSON.parse(jsonContent);

    // Validate OpenAPI version
    if (!spec.openapi || !spec.openapi.startsWith("3.")) {
      throw new Error("Invalid OpenAPI specification. Only version 3.x is supported.");
    }

    const collection: Collection = {
      id: uuidv4(),
      name: spec.info.title,
      description: spec.info.description,
      folders: [],
      requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const requests: Request[] = [];
    const folders: Folder[] = [];

    // Get base URL from servers
    const baseUrl = spec.servers?.[0]?.url || "";

    // Group operations by tags (create folders for each tag)
    const tagFolderMap = new Map<string, Folder>();

    // Process paths
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const methods: Array<keyof PathItem> = [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "options",
        "head",
        "trace",
      ];

      for (const method of methods) {
        const operation = pathItem[method] as Operation | undefined;
        if (!operation || Array.isArray(operation)) continue;

        // Get or create folder for first tag
        const tag = operation.tags?.[0] || "Untagged";
        let folder = tagFolderMap.get(tag);

        if (!folder) {
          folder = {
            id: uuidv4(),
            name: tag,
            collectionId: collection.id,
            requests: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          tagFolderMap.set(tag, folder);
          folders.push(folder);
        }

        // Create request
        const request = convertOperationToRequest(
          operation,
          method.toUpperCase(),
          baseUrl + path,
          collection.id,
          folder.id,
          pathItem.parameters
        );

        requests.push(request);
        folder.requests.push(request.id);
      }
    }

    collection.folders = folders;
    collection.requests = requests.map((r) => r.id);

    return { collection, requests, folders };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format in OpenAPI specification file");
    }
    throw error;
  }
}

/**
 * Convert an OpenAPI operation to a Restify request
 */
function convertOperationToRequest(
  operation: Operation,
  method: string,
  url: string,
  collectionId: string,
  folderId: string,
  pathParameters?: Parameter[]
): Request {
  const name = operation.summary || operation.operationId || `${method} ${url}`;

  // Combine path-level and operation-level parameters
  const allParameters = [...(pathParameters || []), ...(operation.parameters || [])];

  // Extract query parameters
  const queryParams = allParameters
    .filter((p) => p.in === "query")
    .map((p) => ({
      id: uuidv4(),
      key: p.name,
      value: p.schema?.default?.toString() || "",
      enabled: true,
    }));

  // Extract headers
  const headers = allParameters
    .filter((p) => p.in === "header")
    .map((p) => ({
      id: uuidv4(),
      key: p.name,
      value: p.schema?.default?.toString() || "",
      enabled: true,
    }));

  // Convert request body
  const body = operation.requestBody
    ? convertRequestBody(operation.requestBody)
    : { type: "none" as const, content: "" };

  return {
    id: uuidv4(),
    name,
    method: method as Request["method"],
    url,
    queryParams,
    headers,
    body,
    collectionId,
    folderId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Convert OpenAPI request body to Restify format
 */
function convertRequestBody(requestBody: RequestBodySpec): RequestBody {
  if (!requestBody.content) {
    return { type: "none", content: "" };
  }

  // Check for JSON content type
  if (requestBody.content["application/json"]) {
    const jsonContent = requestBody.content["application/json"];
    const example = jsonContent.example ? JSON.stringify(jsonContent.example, null, 2) : "{}";

    return {
      type: "json",
      content: example,
    };
  }

  // Check for form-urlencoded
  if (requestBody.content["application/x-www-form-urlencoded"]) {
    return {
      type: "form-urlencoded",
      content: "[]",
    };
  }

  // Check for multipart/form-data
  if (requestBody.content["multipart/form-data"]) {
    return {
      type: "form-data",
      content: "[]",
    };
  }

  // Check for XML
  if (requestBody.content["application/xml"]) {
    const xmlContent = requestBody.content["application/xml"];
    const example = xmlContent.example?.toString() || "<root></root>";

    return {
      type: "xml",
      content: example,
    };
  }

  // Default to raw
  return {
    type: "raw",
    content: "",
  };
}

/**
 * Validate OpenAPI specification before import
 */
export function validateOpenAPISpec(jsonContent: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const spec = JSON.parse(jsonContent);

    if (!spec.openapi) {
      errors.push("Missing 'openapi' field");
    } else if (!spec.openapi.startsWith("3.")) {
      errors.push(`Unsupported OpenAPI version: ${spec.openapi}. Only 3.x is supported.`);
    }

    if (!spec.info?.title) {
      errors.push("Missing 'info.title' field");
    }

    if (!spec.paths || typeof spec.paths !== "object") {
      errors.push("Missing or invalid 'paths' field");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ["Invalid JSON format"],
    };
  }
}
