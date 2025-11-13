"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  height = "300px",
}: JsonEditorProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center border border-input rounded-md bg-muted/50"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={(val) => onChange(val || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
