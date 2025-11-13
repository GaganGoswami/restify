import { v4 as uuidv4 } from "uuid";
import type { Collection, Folder, Request, RequestBody } from "@/types";

// Postman Collection v2.1 format types
interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  item?: PostmanItem[]; // Folder items
  request?: PostmanRequest; // Request item
}

interface PostmanRequest {
  method: string;
  header?: Array<{ key: string; value: string; disabled?: boolean }>;
  url: string | PostmanUrl;
  body?: PostmanBody;
  description?: string;
}

interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: Array<{ key: string; value: string; disabled?: boolean }>;
}

interface PostmanBody {
  mode: string;
  raw?: string;
  urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
  formdata?: Array<{ key: string; value: string; type?: string; disabled?: boolean }>;
}

/**
 * Import a Postman Collection v2.1 file and convert it to Restify format
 */
export async function importPostmanCollection(
  jsonContent: string
): Promise<{ collection: Collection; requests: Request[]; folders: Folder[] }> {
  try {
    const postmanCollection: PostmanCollection = JSON.parse(jsonContent);

    // Validate schema
    if (
      !postmanCollection.info?.schema?.includes(
        "https://schema.getpostman.com/json/collection/v2.1"
      ) &&
      !postmanCollection.info?.schema?.includes(
        "https://schema.getpostman.com/json/collection/v2.0"
      )
    ) {
      throw new Error("Invalid Postman collection format. Only v2.0 and v2.1 are supported.");
    }

    const collection: Collection = {
      id: uuidv4(),
      name: postmanCollection.info.name,
      description: postmanCollection.info.description,
      folders: [], // Will be populated below
      requests: [], // Will be populated below
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const requests: Request[] = [];
    const folders: Folder[] = [];

    // Process items (folders and requests)
    processPostmanItems(postmanCollection.item, collection.id, null, requests, folders);

    // Note: Collection.folders expects Folder[] and Collection.requests expects string[]
    // So we keep folders as is, but only store request IDs
    collection.folders = folders;
    collection.requests = requests.map((r) => r.id);

    // Populate each folder's requests array with request IDs
    folders.forEach((folder) => {
      folder.requests = requests.filter((r) => r.folderId === folder.id).map((r) => r.id);
    });

    return { collection, requests, folders };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format in Postman collection file");
    }
    throw error;
  }
}

/**
 * Recursively process Postman items (folders and requests)
 */
function processPostmanItems(
  items: PostmanItem[],
  collectionId: string,
  parentFolderId: string | null,
  requests: Request[],
  folders: Folder[]
): void {
  for (const item of items) {
    if (item.item) {
      // This is a folder
      const folder: Folder = {
        id: uuidv4(),
        name: item.name,
        collectionId,
        parentFolderId: parentFolderId || undefined,
        requests: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      folders.push(folder);

      // Recursively process folder items
      processPostmanItems(item.item, collectionId, folder.id, requests, folders);
    } else if (item.request) {
      // This is a request
      const request = convertPostmanRequest(item.name, item.request, collectionId, parentFolderId);
      requests.push(request);
    }
  }
}

/**
 * Convert a Postman request to Restify format
 */
function convertPostmanRequest(
  name: string,
  postmanRequest: PostmanRequest,
  collectionId: string,
  folderId: string | null
): Request {
  // Parse URL
  const url = typeof postmanRequest.url === "string" ? postmanRequest.url : postmanRequest.url.raw;

  // Parse query parameters
  const queryParams =
    typeof postmanRequest.url !== "string" && postmanRequest.url.query
      ? postmanRequest.url.query.map((q) => ({
          id: uuidv4(),
          key: q.key,
          value: q.value,
          enabled: !q.disabled,
        }))
      : [];

  // Parse headers
  const headers = postmanRequest.header
    ? postmanRequest.header.map((h) => ({
        id: uuidv4(),
        key: h.key,
        value: h.value,
        enabled: !h.disabled,
      }))
    : [];

  // Parse body
  const body = postmanRequest.body
    ? convertPostmanBody(postmanRequest.body)
    : { type: "none" as const, content: "" };

  return {
    id: uuidv4(),
    name,
    method: postmanRequest.method.toUpperCase() as Request["method"],
    url,
    queryParams,
    headers,
    body,
    collectionId: collectionId || undefined,
    folderId: folderId || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Convert Postman body format to Restify format
 */
function convertPostmanBody(postmanBody: PostmanBody): RequestBody {
  switch (postmanBody.mode) {
    case "raw":
      // Try to detect if it's JSON
      const content = postmanBody.raw || "";
      try {
        JSON.parse(content);
        return { type: "json", content };
      } catch {
        return { type: "raw", content };
      }

    case "urlencoded":
      return {
        type: "form-urlencoded",
        content: postmanBody.urlencoded
          ? JSON.stringify(
              postmanBody.urlencoded.map((item) => ({
                id: uuidv4(),
                key: item.key,
                value: item.value,
                enabled: !item.disabled,
              }))
            )
          : "",
      };

    case "formdata":
      return {
        type: "form-data",
        content: postmanBody.formdata
          ? JSON.stringify(
              postmanBody.formdata.map((item) => ({
                id: uuidv4(),
                key: item.key,
                value: item.value,
                enabled: !item.disabled,
              }))
            )
          : "",
      };

    default:
      return { type: "none", content: "" };
  }
}

/**
 * Validate a Postman collection file before import
 */
export function validatePostmanCollection(jsonContent: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const collection = JSON.parse(jsonContent);

    if (!collection.info) {
      return { valid: false, error: "Missing 'info' section" };
    }

    if (!collection.info.name) {
      return { valid: false, error: "Missing collection name" };
    }

    if (!collection.info.schema) {
      return { valid: false, error: "Missing schema version" };
    }

    if (!collection.info.schema.includes("postman.com/json/collection/v2")) {
      return {
        valid: false,
        error: "Unsupported schema version. Only v2.0 and v2.1 are supported.",
      };
    }

    if (!Array.isArray(collection.item)) {
      return { valid: false, error: "Invalid or missing 'item' array" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
}
