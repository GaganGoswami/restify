"use client";

import { RequestBody } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonEditor } from "./json-editor";
import { KeyValueEditor } from "./key-value-editor";

interface BodyEditorProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

export function BodyEditor({ body, onChange }: BodyEditorProps) {
  const handleTypeChange = (type: RequestBody["type"]) => {
    onChange({
      ...body,
      type,
      content: type === "json" ? "{}" : "",
      formData: type === "form-data" || type === "form-urlencoded" ? [] : undefined,
    });
  };

  return (
    <div className="p-4">
      <Tabs
        value={body.type}
        onValueChange={(value) => handleTypeChange(value as RequestBody["type"])}
      >
        <TabsList>
          <TabsTrigger value="none">None</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="form-data">Form Data</TabsTrigger>
          <TabsTrigger value="form-urlencoded">URL Encoded</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="binary">Binary</TabsTrigger>
        </TabsList>

        <TabsContent value="none">
          <div className="text-sm text-muted-foreground py-4">
            This request does not have a body
          </div>
        </TabsContent>

        <TabsContent value="json">
          <JsonEditor
            value={body.content}
            onChange={(content: string) => onChange({ ...body, content })}
          />
        </TabsContent>

        <TabsContent value="form-data">
          <KeyValueEditor
            items={body.formData || []}
            onChange={(formData) => onChange({ ...body, formData })}
            placeholder={{ key: "Key", value: "Value" }}
          />
        </TabsContent>

        <TabsContent value="form-urlencoded">
          <KeyValueEditor
            items={body.formData || []}
            onChange={(formData) => onChange({ ...body, formData })}
            placeholder={{ key: "Key", value: "Value" }}
          />
        </TabsContent>

        <TabsContent value="raw">
          <textarea
            value={body.content}
            onChange={(e) => onChange({ ...body, content: e.target.value })}
            className="w-full min-h-[300px] p-3 rounded-md border border-input bg-transparent text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Enter raw request body"
          />
        </TabsContent>

        <TabsContent value="binary">
          <div className="border border-dashed border-input rounded-md p-8 text-center">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange({ ...body, binaryFile: file });
                }
              }}
              className="text-sm"
            />
            {body.binaryFile && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: {body.binaryFile.name} ({(body.binaryFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
