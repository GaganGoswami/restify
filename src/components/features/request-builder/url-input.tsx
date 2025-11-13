"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { isValidUrl } from "@/lib/utils/url";
import { AlertCircle } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function UrlInput({ value, onChange, onValidationChange }: UrlInputProps) {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched && value) {
      const valid = isValidUrl(value);
      setIsValid(valid);
      onValidationChange?.(valid);
    }
  }, [value, touched, onValidationChange]);

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const valid = isValidUrl(value);
      setIsValid(valid);
      onValidationChange?.(valid);
    }
  };

  return (
    <div className="relative flex-1">
      <Input
        type="text"
        placeholder="Enter request URL (e.g., https://api.example.com/users)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={`pr-10 ${!isValid && touched ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />
      {!isValid && touched && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
      )}
      {!isValid && touched && (
        <p className="mt-1 text-xs text-destructive">Please enter a valid URL</p>
      )}
    </div>
  );
}
