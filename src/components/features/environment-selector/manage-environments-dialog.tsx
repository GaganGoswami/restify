"use client";

import { useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEnvironments } from "@/hooks/use-environments";
import { EnvironmentEditor } from "./environment-editor";
import type { Environment } from "@/types/collection";

interface ManageEnvironmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Environment management dialog (FR-036)
 * Allows creating, editing, and deleting environments
 */
export function ManageEnvironmentsDialog({ open, onOpenChange }: ManageEnvironmentsDialogProps) {
  const {
    environments,
    create,
    delete: deleteEnvironment,
    duplicate,
    isCreating,
    isDeleting,
  } = useEnvironments();

  const [newEnvName, setNewEnvName] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);

  const handleCreate = async () => {
    if (!newEnvName.trim()) return;

    try {
      await create({ name: newEnvName.trim() });
      setNewEnvName("");
    } catch (error) {
      console.error("Failed to create environment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this environment? This action cannot be undone.")
    ) {
      return;
    }

    try {
      await deleteEnvironment(id);
      if (selectedEnv?.id === id) {
        setSelectedEnv(null);
      }
    } catch (error) {
      console.error("Failed to delete environment:", error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicate(id);
    } catch (error) {
      console.error("Failed to duplicate environment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Environments</DialogTitle>
          <DialogDescription>
            Create and manage environments with variables for different deployment stages
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
          {/* Environment List */}
          <div className="w-64 flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="New environment name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
              <Button
                onClick={handleCreate}
                disabled={!newEnvName.trim() || isCreating}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto space-y-1">
              {environments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No environments yet.
                  <br />
                  Create one to get started.
                </div>
              ) : (
                environments.map((env) => (
                  <div
                    key={env.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                      selectedEnv?.id === env.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedEnv(env)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{env.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {env.variables.length} variable
                        {env.variables.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(env.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(env.id);
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Environment Editor */}
          <div className="flex-1 border-l pl-4 overflow-auto">
            {selectedEnv ? (
              <EnvironmentEditor environment={selectedEnv} onClose={() => setSelectedEnv(null)} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select an environment to edit variables
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
