import { create } from "zustand";
import type { Request, HttpResponse, ResponseError } from "@/types";

interface RequestState {
  currentRequest: Partial<Request> | null;
  response: HttpResponse | null;
  error: ResponseError | null;
  isLoading: boolean;
  isSaving: boolean;
}

interface RequestStore extends RequestState {
  setCurrentRequest: (request: Partial<Request> | null) => void;
  updateRequest: (updates: Partial<Request>) => void;
  setResponse: (response: HttpResponse | null) => void;
  setError: (error: ResponseError | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  clearResponse: () => void;
  reset: () => void;
}

const initialState: RequestState = {
  currentRequest: null,
  response: null,
  error: null,
  isLoading: false,
  isSaving: false,
};

export const useRequestStore = create<RequestStore>((set) => ({
  ...initialState,

  setCurrentRequest: (request) => set({ currentRequest: request, response: null, error: null }),

  updateRequest: (updates) =>
    set((state) => ({
      currentRequest: state.currentRequest ? { ...state.currentRequest, ...updates } : updates,
    })),

  setResponse: (response) => set({ response, error: null, isLoading: false }),

  setError: (error) => set({ error, response: null, isLoading: false }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsSaving: (saving) => set({ isSaving: saving }),

  clearResponse: () => set({ response: null, error: null }),

  reset: () => set(initialState),
}));
