// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T | Error>;

export interface Timestamp {
  createdAt: Date;
  updatedAt: Date;
}

export interface Identifiable {
  id: string;
}

export interface Nameable {
  name: string;
  description?: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type NonEmptyArray<T> = [T, ...T[]];
