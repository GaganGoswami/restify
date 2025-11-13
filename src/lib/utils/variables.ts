import type { Environment, Variable } from "@/types";

/**
 * Resolve variables with precedence: Collection > Environment > Global (FR-042)
 */
export function resolveVariables(
  input: string,
  environment?: Environment,
  globalVariables: Record<string, string> = {},
  collectionVariables?: Variable[]
): string {
  if (!input) return input;

  let resolved = input;

  // Build variable map with proper precedence: Collection > Environment > Global
  const variables: Record<string, string> = {
    ...globalVariables,
  };

  // Add environment variables (overrides global)
  if (environment) {
    environment.variables
      .filter((v) => v.enabled)
      .forEach((v) => {
        variables[v.key] = v.value;
      });
  }

  // Add collection variables (overrides environment and global)
  if (collectionVariables) {
    collectionVariables
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
  globalVariables: Record<string, string> = {},
  collectionVariables?: Variable[]
): { valid: boolean; missing: string[] } {
  const references = extractVariableReferences(input);
  if (references.length === 0) {
    return { valid: true, missing: [] };
  }

  // Build variable map with proper precedence
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

  if (collectionVariables) {
    collectionVariables
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
  globalVariables: Record<string, string> = {},
  collectionVariables?: Variable[]
) {
  return {
    url: resolveVariables(request.url, environment, globalVariables, collectionVariables),
    headers: request.headers?.map((h) => ({
      ...h,
      value: h.enabled
        ? resolveVariables(h.value, environment, globalVariables, collectionVariables)
        : h.value,
    })),
    queryParams: request.queryParams?.map((q) => ({
      ...q,
      value: q.enabled
        ? resolveVariables(q.value, environment, globalVariables, collectionVariables)
        : q.value,
    })),
  };
}

/**
 * Get all available variables with their scope
 * Returns variables in order of precedence: Collection > Environment > Global
 */
export function getAllVariables(
  environment?: Environment,
  globalVariables: Record<string, string> = {},
  collectionVariables?: Variable[]
): Array<{ key: string; value: string; scope: "global" | "environment" | "collection" }> {
  const result: Array<{
    key: string;
    value: string;
    scope: "global" | "environment" | "collection";
  }> = [];
  const seenKeys = new Set<string>();

  // Add collection variables first (highest precedence)
  if (collectionVariables) {
    collectionVariables
      .filter((v) => v.enabled)
      .forEach((v) => {
        result.push({ key: v.key, value: v.value, scope: "collection" });
        seenKeys.add(v.key);
      });
  }

  // Add environment variables (medium precedence)
  if (environment) {
    environment.variables
      .filter((v) => v.enabled && !seenKeys.has(v.key))
      .forEach((v) => {
        result.push({ key: v.key, value: v.value, scope: "environment" });
        seenKeys.add(v.key);
      });
  }

  // Add global variables (lowest precedence)
  Object.entries(globalVariables).forEach(([key, value]) => {
    if (!seenKeys.has(key)) {
      result.push({ key, value, scope: "global" });
      seenKeys.add(key);
    }
  });

  return result;
}
