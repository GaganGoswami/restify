"use client";

import { KeyValuePair } from "@/types";
import { KeyValueEditor } from "./key-value-editor";

interface HeadersEditorProps {
  headers: KeyValuePair[];
  onChange: (headers: KeyValuePair[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  return (
    <div className="p-4">
      <KeyValueEditor
        items={headers}
        onChange={onChange}
        placeholder={{ key: "Header", value: "Value" }}
      />
    </div>
  );
}
