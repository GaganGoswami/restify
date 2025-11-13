"use client";

import { KeyValuePair } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string };
}

export function KeyValueEditor({
  items,
  onChange,
  placeholder = { key: "Key", value: "Value" },
}: KeyValueEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: uuidv4(),
        key: "",
        value: "",
        enabled: true,
      },
    ]);
  };

  const updateItem = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-xs text-muted-foreground font-medium pb-2">
        <div className="w-8"></div>
        <div>{placeholder.key}</div>
        <div>{placeholder.value}</div>
        <div className="w-8"></div>
      </div>

      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={() => toggleItem(item.id)}
            className="h-4 w-4 rounded border-input"
          />
          <Input
            value={item.key}
            onChange={(e) => updateItem(item.id, { key: e.target.value })}
            placeholder={placeholder.key}
            className={!item.enabled ? "opacity-50" : ""}
          />
          <Input
            value={item.value}
            onChange={(e) => updateItem(item.id, { value: e.target.value })}
            placeholder={placeholder.value}
            className={!item.enabled ? "opacity-50" : ""}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add {placeholder.key}
      </Button>
    </div>
  );
}
