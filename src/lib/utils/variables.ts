import type { Environment } from "@/types";

// Resolve variables in a string
export function resolveVariables(
  input: string,
  environment?: Environment,
  globalVariables: Record<string, string> = {}
): string {
  if (!input) return input;

  let resolved = input;

  // Build variable map
  const variables: Record<string, string> = {
    ...globalVariables,
  };

  // Add environment variables
  if (environment) {
    environment.variables
      .filter((v) => v.enabled)
      .forEach((v) => {
        variables[v.key] = v.value;
      });
  }

  // Replace {{variableName}} patterns
  const regex = /\{\{([^}]+)\}\}/g;
  resolved = resolved.replace(regex, (match, varName) => {
    const trimmedName = varName.trim();
    return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
  });

  return resolved;
}

// Extract variable references from a string
export function extractVariableReferences(input: string): string[] {
  if (!input) return [];

  const regex = /\{\{([^}]+)\}\}/g;
  const matches = input.matchAll(regex);
  const references: string[] = [];

  for (const match of matches) {
    const varName = match[1].trim();
    if (!references.includes(varName)) {
      references.push(varName);
    }
  }

  return references;
}

// Check if a string contains unresolved variables
export function hasUnresolvedVariables(input: string): boolean {
  return /\{\{[^}]+\}\}/.test(input);
}

// Validate that all variables can be resolved
export function validateVariables(
  input: string,
  environment?: Environment,
  globalVariables: Record<string, string> = {}
): { valid: boolean; missing: string[] } {
  const references = extractVariableReferences(input);
  if (references.length === 0) {
    return { valid: true, missing: [] };
  }

  // Build variable map
  const variables: Record<string, string> = {
    ...globalVariables,
  };

  if (environment) {
    environment.variables
      .filter((v) => v.enabled)
      .forEach((v) => {
        variables[v.key] = v.value;
      });
  }

  // Check for missing variables
  const missing = references.filter((ref) => variables[ref] === undefined);

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Resolve all variables in a request
export function resolveRequestVariables(
  request: {
    url: string;
    headers?: Array<{ key: string; value: string; enabled: boolean }>;
    queryParams?: Array<{ key: string; value: string; enabled: boolean }>;
  },
  environment?: Environment,
  globalVariables: Record<string, string> = {}
) {
  return {
    url: resolveVariables(request.url, environment, globalVariables),
    headers: request.headers?.map((h) => ({
      ...h,
      value: h.enabled ? resolveVariables(h.value, environment, globalVariables) : h.value,
    })),
    queryParams: request.queryParams?.map((q) => ({
      ...q,
      value: q.enabled ? resolveVariables(q.value, environment, globalVariables) : q.value,
    })),
  };
}
