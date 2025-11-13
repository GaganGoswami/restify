"use client";

import { useState } from "react";
import { Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnvironments } from "@/hooks/use-environments";

interface EnvironmentSelectorProps {
  onManage?: () => void;
}

/**
 * Environment selector dropdown for app header (FR-044)
 * Allows quick switching between environments with <100ms response (FR-043)
 */
export function EnvironmentSelector({ onManage }: EnvironmentSelectorProps) {
  const {
    environments,
    activeEnvironment,
    switch: switchEnvironment,
    isSwitching,
  } = useEnvironments();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (id: string) => {
    try {
      await switchEnvironment(id);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch environment:", error);
    }
  };

  const handleManage = () => {
    setIsOpen(false);
    onManage?.();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{activeEnvironment?.name || "No Environment"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Environments</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {environments.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No environments yet
          </div>
        ) : (
          environments.map((env) => (
            <DropdownMenuItem
              key={env.id}
              onClick={() => handleSwitch(env.id)}
              disabled={isSwitching}
              className="flex items-center gap-2"
            >
              {env.isActive && <span className="h-2 w-2 rounded-full bg-green-500" />}
              <span className={env.isActive ? "font-medium" : ""}>{env.name}</span>
              {env.variables.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {env.variables.length} vars
                </span>
              )}
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleManage} className="gap-2">
          <Settings className="h-4 w-4" />
          <span>Manage Environments</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
