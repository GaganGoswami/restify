import type { Collection, Folder, Request, RequestBody } from "@/types";

// Postman Collection v2.1 format types
interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
    _postman_id?: string;
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
  header: Array<{ key: string; value: string; disabled?: boolean }>;
  url: PostmanUrl;
  body?: PostmanBody;
  description?: string;
}

interface PostmanUrl {
  raw: string;
  protocol: string;
  host: string[];
  path: string[];
  query?: Array<{ key: string; value: string; disabled?: boolean }>;
}

interface PostmanBody {
  mode: string;
  raw?: string;
  urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
  formdata?: Array<{
    key: string;
    value: string;
    type?: string;
    disabled?: boolean;
  }>;
}

/**
 * Export a Restify collection to Postman Collection v2.1 format
 * @param collection - The collection to export
 * @param requests - All requests in the collection
 * @param folders - All folders in the collection
 * @returns JSON string of the Postman collection
 */
export function exportPostmanCollection(
  collection: Collection,
  requests: Request[],
  folders: Folder[]
): string {
  const postmanCollection: PostmanCollection = {
    info: {
      name: collection.name,
      description: collection.description,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: collection.id,
    },
    item: [],
  };

  // Build a tree structure for folders and requests
  const rootItems = buildPostmanTree(collection, requests, folders);
  postmanCollection.item = rootItems;

  return JSON.stringify(postmanCollection, null, 2);
}

/**
 * Build a hierarchical tree of Postman items (folders and requests)
 */
function buildPostmanTree(
  collection: Collection,
  requests: Request[],
  folders: Folder[]
): PostmanItem[] {
  const items: PostmanItem[] = [];

  // Get root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentFolderId);

  // Add root folders with their children
  for (const folder of rootFolders) {
    items.push(convertFolderToPostmanItem(folder, requests, folders));
  }

  // Add root-level requests (not in any folder)
  const rootRequests = requests.filter((r) => r.collectionId === collection.id && !r.folderId);

  for (const request of rootRequests) {
    items.push(convertRequestToPostmanItem(request));
  }

  return items;
}

/**
 * Convert a Restify folder to a Postman item with children
 */
function convertFolderToPostmanItem(
  folder: Folder,
  allRequests: Request[],
  allFolders: Folder[]
): PostmanItem {
  const item: PostmanItem = {
    name: folder.name,
    item: [],
  };

  // Add subfolders
  const subfolders = allFolders.filter((f) => f.parentFolderId === folder.id);
  for (const subfolder of subfolders) {
    item.item!.push(convertFolderToPostmanItem(subfolder, allRequests, allFolders));
  }

  // Add requests in this folder
  const folderRequests = allRequests.filter((r) => r.folderId === folder.id);
  for (const request of folderRequests) {
    item.item!.push(convertRequestToPostmanItem(request));
  }

  return item;
}

/**
 * Convert a Restify request to a Postman item
 */
function convertRequestToPostmanItem(request: Request): PostmanItem {
  const postmanRequest: PostmanRequest = {
    method: request.method,
    header: request.headers.map((h) => ({
      key: h.key,
      value: h.value,
      disabled: !h.enabled,
    })),
    url: convertToPostmanUrl(request.url, request.queryParams),
  };

  // Add body if present
  if (request.body.type !== "none") {
    postmanRequest.body = convertToPostmanBody(request.body);
  }

  return {
    name: request.name,
    request: postmanRequest,
  };
}

/**
 * Convert Restify URL and query params to Postman URL format
 */
function convertToPostmanUrl(url: string, queryParams: Request["queryParams"]): PostmanUrl {
  let urlWithoutQuery = url;
  let protocol = "https";
  let host: string[] = [];
  let path: string[] = [];

  // Parse URL
  try {
    const urlObj = new URL(url);
    protocol = urlObj.protocol.replace(":", "");
    host = urlObj.hostname.split(".");
    path = urlObj.pathname.split("/").filter((p) => p.length > 0);
    urlWithoutQuery = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    // If URL parsing fails, try to extract parts manually
    const protocolMatch = url.match(/^(\w+):\/\//);
    if (protocolMatch) {
      protocol = protocolMatch[1];
      urlWithoutQuery = url.replace(/^(\w+):\/\//, "");
    }

    const parts = urlWithoutQuery.split("/");
    if (parts[0]) {
      host = parts[0].split(".");
      path = parts.slice(1).filter((p) => p.length > 0);
    }
  }

  const postmanUrl: PostmanUrl = {
    raw: url,
    protocol,
    host,
    path,
  };

  // Add query parameters
  const enabledParams = queryParams.filter((p) => p.enabled);
  if (enabledParams.length > 0) {
    postmanUrl.query = queryParams.map((q) => ({
      key: q.key,
      value: q.value,
      disabled: !q.enabled,
    }));
  }

  return postmanUrl;
}

/**
 * Convert Restify request body to Postman body format
 */
function convertToPostmanBody(body: RequestBody): PostmanBody {
  switch (body.type) {
    case "json":
    case "xml":
    case "raw":
      return {
        mode: "raw",
        raw: body.content,
      };

    case "form-urlencoded":
      try {
        const parsed = JSON.parse(body.content);
        return {
          mode: "urlencoded",
          urlencoded: Array.isArray(parsed)
            ? parsed.map((item) => ({
                key: item.key,
                value: item.value,
                disabled: !item.enabled,
              }))
            : [],
        };
      } catch {
        return {
          mode: "urlencoded",
          urlencoded: [],
        };
      }

    case "form-data":
      try {
        const parsed = JSON.parse(body.content);
        return {
          mode: "formdata",
          formdata: Array.isArray(parsed)
            ? parsed.map((item) => ({
                key: item.key,
                value: item.value,
                type: item.type || "text",
                disabled: !item.enabled,
              }))
            : [],
        };
      } catch {
        return {
          mode: "formdata",
          formdata: [],
        };
      }

    case "binary":
      return {
        mode: "raw",
        raw: body.content,
      };

    case "graphql":
      return {
        mode: "raw",
        raw: body.content,
      };

    default:
      return {
        mode: "raw",
        raw: "",
      };
  }
}
