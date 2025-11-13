import { db } from "@/lib/db";
import type { Collection, Folder } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Collections
export async function createCollection(
  data: Omit<Collection, "id" | "folders" | "requests" | "createdAt" | "updatedAt">
): Promise<Collection> {
  const now = new Date();
  const collection: Collection = {
    ...data,
    id: uuidv4(),
    folders: [],
    requests: [],
    createdAt: now,
    updatedAt: now,
  };

  await db.collections.add(collection);
  return collection;
}

export async function getCollection(id: string): Promise<Collection | undefined> {
  return db.collections.get(id);
}

export async function getAllCollections(): Promise<Collection[]> {
  return db.collections.toArray();
}

export async function updateCollection(id: string, data: Partial<Collection>): Promise<void> {
  await db.collections.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteCollection(id: string): Promise<void> {
  // Delete all folders in the collection
  await db.folders.where({ collectionId: id }).delete();

  // Delete all requests in the collection
  await db.requests.where({ collectionId: id }).delete();

  // Delete the collection
  await db.collections.delete(id);
}

// Folders
export async function createFolder(
  data: Omit<Folder, "id" | "requests" | "createdAt" | "updatedAt">
): Promise<Folder> {
  const now = new Date();
  const folder: Folder = {
    ...data,
    id: uuidv4(),
    requests: [],
    createdAt: now,
    updatedAt: now,
  };

  await db.folders.add(folder);
  return folder;
}

export async function getFolder(id: string): Promise<Folder | undefined> {
  return db.folders.get(id);
}

export async function getFoldersByCollection(collectionId: string): Promise<Folder[]> {
  return db.folders.where({ collectionId }).toArray();
}

export async function updateFolder(id: string, data: Partial<Folder>): Promise<void> {
  await db.folders.update(id, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  // Delete all requests in the folder
  await db.requests.where({ folderId: id }).delete();

  // Delete the folder
  await db.folders.delete(id);
}

// Get folder hierarchy (parent-child relationships)
export async function getFolderHierarchy(collectionId: string): Promise<Folder[]> {
  const folders = await getFoldersByCollection(collectionId);

  // Build a map for quick lookup
  const folderMap = new Map(folders.map((f) => [f.id, { ...f, children: [] as Folder[] }]));

  // Build the tree structure
  const roots: Folder[] = [];
  for (const folder of folders) {
    const folderWithChildren = folderMap.get(folder.id)!;
    if (folder.parentFolderId) {
      const parent = folderMap.get(folder.parentFolderId);
      if (parent) {
        parent.children.push(folderWithChildren);
      } else {
        roots.push(folderWithChildren);
      }
    } else {
      roots.push(folderWithChildren);
    }
  }

  return roots;
}
