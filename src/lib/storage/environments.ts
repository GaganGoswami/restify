import { db } from "@/lib/db";
import type { Environment, Variable } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Environments
export async function createEnvironment(
  data: Omit<Environment, "id" | "createdAt" | "updatedAt">
): Promise<Environment> {
  const now = new Date();

  // If setting as active, deactivate others
  if (data.isActive) {
    await db.environments.toCollection().modify({ isActive: false });
  }

  const environment: Environment = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  await db.environments.add(environment);
  return environment;
}

export async function getEnvironment(id: string): Promise<Environment | undefined> {
  return db.environments.get(id);
}

export async function getAllEnvironments(): Promise<Environment[]> {
  return db.environments.toArray();
}

export async function getActiveEnvironment(): Promise<Environment | undefined> {
  return db.environments.where({ isActive: true }).first();
}

export async function updateEnvironment(id: string, data: Partial<Environment>): Promise<void> {
  // If setting as active, deactivate others
  if (data.isActive === true) {
    await db.environments.toCollection().modify({ isActive: false });
  }

  await db.environments.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteEnvironment(id: string): Promise<void> {
  await db.environments.delete(id);
}

export async function setActiveEnvironment(id: string): Promise<void> {
  // Deactivate all environments
  await db.environments.toCollection().modify({ isActive: false });

  // Activate the specified environment
  await db.environments.update(id, { isActive: true, updatedAt: new Date() });
}

// Variables (helper functions for working with environment variables)
export function getVariableValue(
  environment: Environment | undefined,
  key: string
): string | undefined {
  if (!environment) return undefined;
  const variable = environment.variables.find((v) => v.key === key && v.enabled);
  return variable?.value;
}

export function getAllVariables(environment: Environment | undefined): Record<string, string> {
  if (!environment) return {};

  return environment.variables
    .filter((v) => v.enabled)
    .reduce(
      (acc, v) => {
        acc[v.key] = v.value;
        return acc;
      },
      {} as Record<string, string>
    );
}

export async function addVariable(
  environmentId: string,
  variable: Omit<Variable, "id">
): Promise<void> {
  const environment = await getEnvironment(environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }

  const newVariable: Variable = {
    ...variable,
    id: uuidv4(),
  };

  environment.variables.push(newVariable);
  await updateEnvironment(environmentId, { variables: environment.variables });
}

export async function updateVariable(
  environmentId: string,
  variableId: string,
  data: Partial<Variable>
): Promise<void> {
  const environment = await getEnvironment(environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }

  const variableIndex = environment.variables.findIndex((v) => v.id === variableId);
  if (variableIndex === -1) {
    throw new Error("Variable not found");
  }

  environment.variables[variableIndex] = {
    ...environment.variables[variableIndex],
    ...data,
  };

  await updateEnvironment(environmentId, { variables: environment.variables });
}

export async function deleteVariable(environmentId: string, variableId: string): Promise<void> {
  const environment = await getEnvironment(environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }

  environment.variables = environment.variables.filter((v) => v.id !== variableId);
  await updateEnvironment(environmentId, { variables: environment.variables });
}
