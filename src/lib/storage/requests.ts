import { db } from "@/lib/db";
import type { Request } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Create a new request
export async function createRequest(
  data: Omit<Request, "id" | "createdAt" | "updatedAt">
): Promise<Request> {
  const now = new Date();
  const request: Request = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  await db.requests.add(request);
  return request;
}

// Get a request by ID
export async function getRequest(id: string): Promise<Request | undefined> {
  return db.requests.get(id);
}

// Get all requests
export async function getAllRequests(): Promise<Request[]> {
  return db.requests.toArray();
}

// Get requests by collection
export async function getRequestsByCollection(collectionId: string): Promise<Request[]> {
  return db.requests.where({ collectionId }).toArray();
}

// Get requests by folder
export async function getRequestsByFolder(folderId: string): Promise<Request[]> {
  return db.requests.where({ folderId }).toArray();
}

// Update a request
export async function updateRequest(id: string, data: Partial<Request>): Promise<void> {
  await db.requests.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

// Delete a request
export async function deleteRequest(id: string): Promise<void> {
  await db.requests.delete(id);
}

// Delete all requests in a collection
export async function deleteRequestsByCollection(collectionId: string): Promise<void> {
  await db.requests.where({ collectionId }).delete();
}

// Delete all requests in a folder
export async function deleteRequestsByFolder(folderId: string): Promise<void> {
  await db.requests.where({ folderId }).delete();
}

// Search requests by name or URL
export async function searchRequests(query: string): Promise<Request[]> {
  const lowerQuery = query.toLowerCase();
  return db.requests
    .filter(
      (request) =>
        request.name.toLowerCase().includes(lowerQuery) ||
        request.url.toLowerCase().includes(lowerQuery)
    )
    .toArray();
}

// Duplicate a request
export async function duplicateRequest(id: string): Promise<Request> {
  const original = await getRequest(id);
  if (!original) {
    throw new Error("Request not found");
  }

  const duplicate: Request = {
    ...original,
    id: uuidv4(),
    name: `${original.name} (Copy)`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.requests.add(duplicate);
  return duplicate;
}

// Move request to a different collection/folder
export async function moveRequest(
  id: string,
  collectionId?: string,
  folderId?: string
): Promise<void> {
  await updateRequest(id, { collectionId, folderId });
}
