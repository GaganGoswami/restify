import { v4 as uuidv4 } from "uuid";
import type { Request, RequestBody } from "@/types";

/**
 * Import a cURL command and convert to Restify request
 * @param curlCommand - The cURL command string
 * @returns A Restify request object
 */
export async function importCurlCommand(curlCommand: string): Promise<Request> {
  try {
    const parsed = parseCurlCommand(curlCommand);

    const request: Request = {
      id: uuidv4(),
      name: `${parsed.method} ${getPathFromUrl(parsed.url)}`,
      method: parsed.method as Request["method"],
      url: parsed.url,
      queryParams: [],
      headers: parsed.headers,
      body: parsed.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return request;
  } catch (error) {
    throw new Error(
      `Failed to parse cURL command: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

interface ParsedCurl {
  method: string;
  url: string;
  headers: Array<{ id: string; key: string; value: string; enabled: boolean }>;
  body: RequestBody;
}

/**
 * Parse a cURL command into its components
 */
function parseCurlCommand(command: string): ParsedCurl {
  // Remove leading/trailing whitespace and newlines
  const cleaned = command.trim().replace(/\\\n/g, " ").replace(/\s+/g, " ");

  // Extract URL (required)
  const urlMatch = cleaned.match(/curl\s+['"]([^'"]+)['"]/) || cleaned.match(/curl\s+([^\s-]+)/);

  if (!urlMatch) {
    throw new Error("Could not extract URL from cURL command");
  }

  const url = urlMatch[1];

  // Extract method (default to GET)
  const methodMatch = cleaned.match(/-X\s+([A-Z]+)/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

  // Extract headers
  const headers: Array<{
    id: string;
    key: string;
    value: string;
    enabled: boolean;
  }> = [];
  const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
  let headerMatch;

  while ((headerMatch = headerRegex.exec(cleaned)) !== null) {
    headers.push({
      id: uuidv4(),
      key: headerMatch[1].trim(),
      value: headerMatch[2].trim(),
      enabled: true,
    });
  }

  // Extract body data
  let body: RequestBody = { type: "none", content: "" };

  // Check for --data, --data-raw, --data-binary, -d
  const dataMatch =
    cleaned.match(/(?:--data|--data-raw|-d)\s+['"]([^'"]*)['"]/s) ||
    cleaned.match(/(?:--data|--data-raw|-d)\s+([^\s-]+)/);

  if (dataMatch) {
    const data = dataMatch[1];

    // Try to detect JSON
    if (data.trim().startsWith("{") || data.trim().startsWith("[")) {
      try {
        JSON.parse(data);
        body = { type: "json", content: data };
      } catch {
        body = { type: "raw", content: data };
      }
    } else {
      body = { type: "raw", content: data };
    }
  }

  // Check for --data-binary
  const binaryMatch = cleaned.match(/--data-binary\s+['"]([^'"]*)['"]/s);
  if (binaryMatch) {
    body = { type: "binary", content: binaryMatch[1] };
  }

  // Check for form data
  const formMatch = cleaned.match(/--form\s+['"]([^'"]*)['"]/);
  if (formMatch) {
    const formData = parseFormData(cleaned);
    body = {
      type: "form-data",
      content: JSON.stringify(formData),
    };
  }

  return {
    method,
    url,
    headers,
    body,
  };
}

/**
 * Parse form data from cURL command
 */
function parseFormData(
  command: string
): Array<{ id: string; key: string; value: string; enabled: boolean }> {
  const formData: Array<{
    id: string;
    key: string;
    value: string;
    enabled: boolean;
  }> = [];
  const formRegex = /--form\s+['"]([^=]+)=([^'"]+)['"]/g;
  let match;

  while ((match = formRegex.exec(command)) !== null) {
    formData.push({
      id: uuidv4(),
      key: match[1].trim(),
      value: match[2].trim(),
      enabled: true,
    });
  }

  return formData;
}

/**
 * Extract path from URL for request name
 */
function getPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname || "/";
  } catch {
    // If URL parsing fails, try to extract path manually
    const pathMatch = url.match(/^https?:\/\/[^/]+(.*)$/);
    return pathMatch ? pathMatch[1] || "/" : url;
  }
}

/**
 * Validate cURL command before import
 */
export function validateCurlCommand(command: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Remove whitespace
  const cleaned = command.trim();

  if (!cleaned.startsWith("curl")) {
    errors.push("Command must start with 'curl'");
  }

  // Check for URL
  const urlMatch = cleaned.match(/curl\s+['"]([^'"]+)['"]/) || cleaned.match(/curl\s+([^\s-]+)/);

  if (!urlMatch) {
    errors.push("Could not find URL in cURL command");
  } else {
    const url = urlMatch[1];
    try {
      new URL(url);
    } catch {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errors.push("URL must start with http:// or https://");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
