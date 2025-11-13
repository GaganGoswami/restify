"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MethodSelector } from "@/components/features/request-builder/method-selector";
import { UrlInput } from "@/components/features/request-builder/url-input";
import { QueryParams } from "@/components/features/request-builder/query-params";
import { HeadersEditor } from "@/components/features/request-builder/headers-editor";
import { BodyEditor } from "@/components/features/request-builder/body-editor";
import { SendButton } from "@/components/features/request-builder/send-button";
import { ResponseViewer } from "@/components/features/response-viewer/response-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExecuteRequest } from "@/hooks/use-request";
import { useRequestStore } from "@/stores/request-store";
import type { HttpMethod, KeyValuePair, RequestBody } from "@/types";

export default function HomePage() {
  const { response, error } = useRequestStore();
  const { execute, isLoading } = useExecuteRequest();

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState<RequestBody>({
    type: "none",
    content: "",
  });

  const handleSend = () => {
    if (!url || !isUrlValid) return;

    const request = {
      id: uuidv4(),
      name: `${method} ${url}`,
      method,
      url,
      queryParams,
      headers,
      body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    execute(request);
  };

  return (
    <main className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Restify</h1>
        <p className="text-sm text-muted-foreground">REST API Testing Tool</p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Request Builder - Left Side */}
        <div className="flex flex-col w-1/2 border-r overflow-auto">
          {/* URL Bar */}
          <div className="flex gap-2 p-4 border-b">
            <MethodSelector value={method} onChange={setMethod} />
            <UrlInput value={url} onChange={setUrl} onValidationChange={setIsUrlValid} />
            <SendButton onSend={handleSend} isLoading={isLoading} disabled={!url || !isUrlValid} />
          </div>

          {/* Request Configuration Tabs */}
          <Tabs defaultValue="params" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="params">Query Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="flex-1 mt-0">
              <QueryParams params={queryParams} onChange={setQueryParams} />
            </TabsContent>

            <TabsContent value="headers" className="flex-1 mt-0">
              <HeadersEditor headers={headers} onChange={setHeaders} />
            </TabsContent>

            <TabsContent value="body" className="flex-1 mt-0">
              <BodyEditor body={body} onChange={setBody} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Response Viewer - Right Side */}
        <div className="flex flex-col w-1/2 overflow-auto">
          <ResponseViewer response={response} error={error} />
        </div>
      </div>
    </main>
  );
}
