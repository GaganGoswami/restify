import { cn } from "@/lib/utils";

interface VariableScopeBadgeProps {
  scope: "global" | "environment" | "collection";
  className?: string;
}

/**
 * Variable scope indicator badge (FR-041)
 * Shows whether a variable is Global, Environment-specific, or Collection-specific
 */
export function VariableScopeBadge({ scope, className }: VariableScopeBadgeProps) {
  const scopeStyles = {
    global: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    environment: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    collection: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const scopeLabels = {
    global: "Global",
    environment: "Environment",
    collection: "Collection",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        scopeStyles[scope],
        className
      )}
    >
      {scopeLabels[scope]}
    </span>
  );
}
