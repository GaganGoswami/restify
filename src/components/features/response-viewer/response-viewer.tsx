"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseBody } from "./response-body";
import { ResponseMetadata } from "./response-metadata";
import { ResponseHeaders } from "./response-headers";
import type { HttpResponse } from "@/types";

interface ResponseViewerProps {
  response: HttpResponse | null;
  error?: { message: string; code?: string } | null;
}

export function ResponseViewer({ response, error }: ResponseViewerProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Request Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          {error.code && <p className="text-xs text-muted-foreground">Error code: {error.code}</p>}
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">No Response</h3>
          <p className="text-sm text-muted-foreground">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ResponseMetadata
        status={response.status}
        statusText={response.statusText}
        time={response.time}
        size={response.size}
      />

      <Tabs defaultValue="body" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="flex-1 m-0">
          <ResponseBody body={response.body} headers={response.headers} />
        </TabsContent>

        <TabsContent value="headers" className="flex-1 m-0">
          <ResponseHeaders headers={response.headers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
