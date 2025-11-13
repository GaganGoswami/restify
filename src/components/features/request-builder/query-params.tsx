"use client";

import { KeyValuePair } from "@/types";
import { KeyValueEditor } from "./key-value-editor";

interface QueryParamsProps {
  params: KeyValuePair[];
  onChange: (params: KeyValuePair[]) => void;
}

export function QueryParams({ params, onChange }: QueryParamsProps) {
  return (
    <div className="p-4">
      <KeyValueEditor
        items={params}
        onChange={onChange}
        placeholder={{ key: "Parameter", value: "Value" }}
      />
    </div>
  );
}
