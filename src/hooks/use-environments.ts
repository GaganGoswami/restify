import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import type { Environment, Variable } from "@/types/collection";

/**
 * Hook for managing environments
 * Provides CRUD operations with <100ms response time per FR-043
 */
export function useEnvironments() {
  const queryClient = useQueryClient();

  // Fetch all environments
  const { data: environments = [], isLoading } = useQuery({
    queryKey: ["environments"],
    queryFn: async () => {
      const envs = await db.environments.toArray();
      return envs;
    },
  });

  // Get active environment
  const activeEnvironment = environments.find((env) => env.isActive);

  // Create new environment
  const createMutation = useMutation({
    mutationFn: async ({ name, variables = [] }: { name: string; variables?: Variable[] }) => {
      const now = new Date();
      const newEnvironment: Environment = {
        id: crypto.randomUUID(),
        name,
        variables,
        isActive: environments.length === 0, // First environment is active by default
        createdAt: now,
        updatedAt: now,
      };
      await db.environments.add(newEnvironment);
      return newEnvironment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Update environment
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Environment, "id" | "createdAt">>;
    }) => {
      await db.environments.update(id, {
        ...updates,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Delete environment
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const env = await db.environments.get(id);
      if (env?.isActive && environments.length > 1) {
        // If deleting active environment, activate another one
        const otherEnv = environments.find((e) => e.id !== id);
        if (otherEnv) {
          await db.environments.update(otherEnv.id, { isActive: true });
        }
      }
      await db.environments.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Switch active environment (must be <100ms per FR-043)
  const switchEnvironment = useMutation({
    mutationFn: async (id: string) => {
      // Deactivate all environments
      await Promise.all(
        environments.map((env) => db.environments.update(env.id, { isActive: false }))
      );
      // Activate selected environment
      await db.environments.update(id, { isActive: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Duplicate environment
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const env = await db.environments.get(id);
      if (!env) throw new Error("Environment not found");

      const now = new Date();
      const newEnvironment: Environment = {
        ...env,
        id: crypto.randomUUID(),
        name: `${env.name} (Copy)`,
        isActive: false,
        createdAt: now,
        updatedAt: now,
        variables: env.variables.map((v) => ({
          ...v,
          id: crypto.randomUUID(),
        })),
      };
      await db.environments.add(newEnvironment);
      return newEnvironment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Add variable to environment
  const addVariableMutation = useMutation({
    mutationFn: async ({
      environmentId,
      variable,
    }: {
      environmentId: string;
      variable: Omit<Variable, "id">;
    }) => {
      const env = await db.environments.get(environmentId);
      if (!env) throw new Error("Environment not found");

      const newVariable: Variable = {
        ...variable,
        id: crypto.randomUUID(),
      };
      const updatedVariables = [...env.variables, newVariable];

      await db.environments.update(environmentId, {
        variables: updatedVariables,
        updatedAt: new Date(),
      });
      return newVariable;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Update variable in environment
  const updateVariableMutation = useMutation({
    mutationFn: async ({
      environmentId,
      variableId,
      updates,
    }: {
      environmentId: string;
      variableId: string;
      updates: Partial<Omit<Variable, "id">>;
    }) => {
      const env = await db.environments.get(environmentId);
      if (!env) throw new Error("Environment not found");

      const updatedVariables = env.variables.map((v) =>
        v.id === variableId ? { ...v, ...updates } : v
      );

      await db.environments.update(environmentId, {
        variables: updatedVariables,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  // Delete variable from environment
  const deleteVariableMutation = useMutation({
    mutationFn: async ({
      environmentId,
      variableId,
    }: {
      environmentId: string;
      variableId: string;
    }) => {
      const env = await db.environments.get(environmentId);
      if (!env) throw new Error("Environment not found");

      const updatedVariables = env.variables.filter((v) => v.id !== variableId);

      await db.environments.update(environmentId, {
        variables: updatedVariables,
        updatedAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });

  return {
    environments,
    activeEnvironment,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    switch: switchEnvironment.mutateAsync,
    duplicate: duplicateMutation.mutateAsync,
    addVariable: addVariableMutation.mutateAsync,
    updateVariable: updateVariableMutation.mutateAsync,
    deleteVariable: deleteVariableMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSwitching: switchEnvironment.isPending,
  };
}
