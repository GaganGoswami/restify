"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnvironments } from "@/hooks/use-environments";
import type { Environment, Variable } from "@/types/collection";

interface EnvironmentEditorProps {
  environment: Environment;
  onClose?: () => void;
}

/**
 * Environment editor for managing variables (FR-037)
 * Supports adding, editing, and deleting variables with type selection
 */
export function EnvironmentEditor({ environment, onClose }: EnvironmentEditorProps) {
  const { update, addVariable, updateVariable, deleteVariable } = useEnvironments();
  const [name, setName] = useState(environment.name);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<"default" | "secret">("default");
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  const handleUpdateName = async () => {
    if (name.trim() && name !== environment.name) {
      try {
        await update({ id: environment.id, updates: { name: name.trim() } });
      } catch (error) {
        console.error("Failed to update environment name:", error);
        setName(environment.name);
      }
    }
  };

  const handleAddVariable = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    try {
      await addVariable({
        environmentId: environment.id,
        variable: {
          key: newKey.trim(),
          value: newValue.trim(),
          type: newType,
          enabled: true,
        },
      });
      setNewKey("");
      setNewValue("");
      setNewType("default");
    } catch (error) {
      console.error("Failed to add variable:", error);
    }
  };

  const handleUpdateVariable = async (variableId: string, updates: Partial<Variable>) => {
    try {
      await updateVariable({
        environmentId: environment.id,
        variableId,
        updates,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update variable:", error);
    }
  };

  const handleDeleteVariable = async (variableId: string) => {
    try {
      await deleteVariable({
        environmentId: environment.id,
        variableId,
      });
    } catch (error) {
      console.error("Failed to delete variable:", error);
    }
  };

  const toggleSecret = (variableId: string) => {
    const newShowSecrets = new Set(showSecrets);
    if (newShowSecrets.has(variableId)) {
      newShowSecrets.delete(variableId);
    } else {
      newShowSecrets.add(variableId);
    }
    setShowSecrets(newShowSecrets);
  };

  return (
    <div className="space-y-4">
      {/* Environment Name */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="env-name">Environment Name</Label>
          <Input
            id="env-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleUpdateName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateName();
              }
            }}
          />
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="mt-6">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Variables Table */}
      <div>
        <Label>Variables</Label>
        <div className="mt-2 border rounded-md">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 text-sm font-medium w-[30%]">Key</th>
                <th className="text-left p-2 text-sm font-medium w-[40%]">Value</th>
                <th className="text-left p-2 text-sm font-medium w-[15%]">Type</th>
                <th className="text-right p-2 text-sm font-medium w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {environment.variables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-muted-foreground">
                    No variables yet. Add one below.
                  </td>
                </tr>
              ) : (
                environment.variables.map((variable) => (
                  <tr key={variable.id} className="border-t">
                    <td className="p-2">
                      {editingId === variable.id ? (
                        <Input
                          defaultValue={variable.key}
                          onBlur={(e) => handleUpdateVariable(variable.id, { key: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        <span className="font-mono text-sm">{variable.key}</span>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === variable.id ? (
                        <Input
                          type={
                            variable.type === "secret" && !showSecrets.has(variable.id)
                              ? "password"
                              : "text"
                          }
                          defaultValue={variable.value}
                          onBlur={(e) =>
                            handleUpdateVariable(variable.id, { value: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm truncate">
                            {variable.type === "secret" && !showSecrets.has(variable.id)
                              ? "••••••••"
                              : variable.value}
                          </span>
                          {variable.type === "secret" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleSecret(variable.id)}
                            >
                              {showSecrets.has(variable.id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {variable.type}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingId(variable.id)}
                        >
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeleteVariable(variable.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {/* Add New Variable Row */}
              <tr className="border-t bg-muted/20">
                <td className="p-2">
                  <Input
                    placeholder="key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddVariable();
                      }
                    }}
                  />
                </td>
                <td className="p-2">
                  <Input
                    placeholder="value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddVariable();
                      }
                    }}
                  />
                </td>
                <td className="p-2">
                  <Select
                    value={newType}
                    onValueChange={(value) => setNewType(value as "default" | "secret")}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="secret">Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Button
                    onClick={handleAddVariable}
                    disabled={!newKey.trim() || !newValue.trim()}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
