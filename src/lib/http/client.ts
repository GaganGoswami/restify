import type { Request, HttpResponse, ResponseError } from "@/types";

export interface HttpClientOptions {
  timeout?: number;
  followRedirects?: boolean;
  validateSSL?: boolean;
  proxyUrl?: string;
}

// Execute an HTTP request
export async function executeRequest(
  request: Request,
  options: HttpClientOptions = {}
): Promise<HttpResponse> {
  const startTime = performance.now();

  try {
    // Build headers
    const headers = new Headers();
    request.headers
      .filter((h) => h.enabled && h.key && h.value)
      .forEach((h) => {
        headers.append(h.key, h.value);
      });

    // Build body
    let body: BodyInit | undefined;
    if (request.body.type !== "none" && ["POST", "PUT", "PATCH"].includes(request.method)) {
      if (request.body.type === "json") {
        headers.set("Content-Type", "application/json");
        body = request.body.content;
      } else if (request.body.type === "xml") {
        headers.set("Content-Type", "application/xml");
        body = request.body.content;
      } else if (request.body.type === "form-urlencoded") {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
        const params = new URLSearchParams();
        request.body.formData
          ?.filter((f) => f.enabled && f.key)
          .forEach((f) => params.append(f.key, f.value));
        body = params.toString();
      } else if (request.body.type === "form-data") {
        const formData = new FormData();
        request.body.formData
          ?.filter((f) => f.enabled && f.key)
          .forEach((f) => formData.append(f.key, f.value));
        body = formData;
      } else if (request.body.type === "raw") {
        body = request.body.content;
      }
    }

    // Build URL with query params
    const url = new URL(request.url);
    request.queryParams
      .filter((q) => q.enabled && q.key)
      .forEach((q) => {
        url.searchParams.append(q.key, q.value);
      });

    // Execute fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
      redirect: options.followRedirects === false ? "manual" : "follow",
    });

    clearTimeout(timeoutId);

    // Parse response
    const endTime = performance.now();
    const responseText = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseText,
      time: Math.round(endTime - startTime),
      size: new Blob([responseText]).size,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Request failed";
    const errorCode =
      error instanceof Error && "code" in error
        ? String((error as { code: unknown }).code)
        : undefined;

    throw {
      message: errorMessage,
      code: errorCode,
      timestamp: new Date(),
    } as ResponseError;
  }
}

// Helper to format response body
export function formatResponseBody(body: string, contentType?: string): string {
  try {
    if (contentType?.includes("application/json")) {
      return JSON.stringify(JSON.parse(body), null, 2);
    }
    return body;
  } catch {
    return body;
  }
}

// Helper to get content type from headers
export function getContentType(headers: Record<string, string>): string | undefined {
  return Object.entries(headers).find(([key]) => key.toLowerCase() === "content-type")?.[1];
}

// Helper to check if response is success
export function isSuccessResponse(status: number): boolean {
  return status >= 200 && status < 300;
}
