// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative URL or missing protocol
    if (url.startsWith("/")) {
      return true;
    }
    // Try adding protocol
    try {
      new URL(`http://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

// Normalize URL (add protocol if missing)
export function normalizeUrl(url: string): string {
  if (!url) return url;

  try {
    new URL(url);
    return url;
  } catch {
    if (url.startsWith("/")) {
      return url;
    }
    return `https://${url}`;
  }
}

// Extract hostname from URL
export function getHostname(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

// Extract protocol from URL
export function getProtocol(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol.replace(":", "");
  } catch {
    return null;
  }
}

// Parse query parameters from URL
export function parseQueryParams(url: string): Record<string, string> {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

// Build URL with query parameters
export function buildUrl(baseUrl: string, params: Record<string, string>): string {
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.toString();
  } catch {
    return baseUrl;
  }
}
