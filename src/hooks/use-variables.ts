import { useMemo } from "react";
import type { Environment, Variable } from "@/types/collection";
import {
  resolveVariables,
  extractVariableReferences,
  validateVariables,
  getAllVariables,
} from "@/lib/utils/variables";

/**
 * Hook for working with variables
 * Provides resolution with precedence: Collection > Environment > Global (FR-042)
 */
export function useVariables(options: {
  environment?: Environment;
  globalVariables?: Record<string, string>;
  collectionVariables?: Variable[];
}) {
  const { environment, globalVariables = {}, collectionVariables } = options;

  // Get all available variables with their scope
  const allVariables = useMemo(
    () => getAllVariables(environment, globalVariables, collectionVariables),
    [environment, globalVariables, collectionVariables]
  );

  // Resolve a string with variables
  const resolve = useMemo(
    () => (input: string) =>
      resolveVariables(input, environment, globalVariables, collectionVariables),
    [environment, globalVariables, collectionVariables]
  );

  // Extract variable references from a string
  const extract = useMemo(() => extractVariableReferences, []);

  // Validate that all variables in a string can be resolved
  const validate = useMemo(
    () => (input: string) =>
      validateVariables(input, environment, globalVariables, collectionVariables),
    [environment, globalVariables, collectionVariables]
  );

  // Get variable value by key (respecting precedence)
  const getValue = useMemo(
    () => (key: string) => {
      const variable = allVariables.find((v) => v.key === key);
      return variable?.value;
    },
    [allVariables]
  );

  // Get variable scope by key
  const getScope = useMemo(
    () => (key: string) => {
      const variable = allVariables.find((v) => v.key === key);
      return variable?.scope;
    },
    [allVariables]
  );

  return {
    allVariables,
    resolve,
    extract,
    validate,
    getValue,
    getScope,
  };
}
