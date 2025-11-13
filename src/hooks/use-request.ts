import { useMutation } from "@tanstack/react-query";
import { useRequestStore } from "@/stores/request-store";
import { executeRequest } from "@/lib/http/client";
import { createHistoryEntry } from "@/lib/storage/history";
import type { Request, HttpResponse, ResponseError } from "@/types";

export function useExecuteRequest() {
  const { setResponse, setError, setIsLoading } = useRequestStore();

  const mutation = useMutation({
    mutationFn: async (request: Request) => {
      setIsLoading(true);

      try {
        const response = await executeRequest(request);

        // Save to history
        await createHistoryEntry({
          requestId: request.id,
          method: request.method,
          url: request.url,
          status: response.status,
          statusText: response.statusText,
          duration: response.time,
          request,
          response,
        });

        return response;
      } catch (error) {
        const responseError = error as ResponseError;

        // Save error to history
        await createHistoryEntry({
          requestId: request.id,
          method: request.method,
          url: request.url,
          request,
          error: responseError,
        });

        throw responseError;
      }
    },
    onSuccess: (data: HttpResponse) => {
      setResponse(data);
    },
    onError: (error: ResponseError) => {
      setError(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    response: mutation.data,
    error: mutation.error,
  };
}
