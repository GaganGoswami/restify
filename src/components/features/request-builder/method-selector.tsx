"use client";

import { HttpMethod } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-green-600 dark:text-green-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-orange-600 dark:text-orange-400",
  PATCH: "text-yellow-600 dark:text-yellow-400",
  DELETE: "text-red-600 dark:text-red-400",
  HEAD: "text-purple-600 dark:text-purple-400",
  OPTIONS: "text-gray-600 dark:text-gray-400",
};

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as HttpMethod)}>
      <SelectTrigger className={`w-[120px] font-semibold ${METHOD_COLORS[value]}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HTTP_METHODS.map((method) => (
          <SelectItem
            key={method}
            value={method}
            className={`font-semibold ${METHOD_COLORS[method]}`}
          >
            {method}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
