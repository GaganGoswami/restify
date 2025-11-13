// GraphQL type definitions
export interface GraphQLRequest {
  id: string;
  name: string;
  url: string;
  query: string;
  variables?: Record<string, unknown>;
  headers?: import("./request").KeyValuePair[];
  operationName?: string;
  collectionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphQLResponse {
  data?: unknown;
  errors?: GraphQLError[];
  extensions?: Record<string, unknown>;
  status: number;
  time: number;
  timestamp: Date;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface GraphQLSchema {
  url: string;
  introspection?: GraphQLIntrospectionResult;
  lastFetched?: Date;
}

export interface GraphQLIntrospectionResult {
  __schema: {
    queryType: { name: string };
    mutationType?: { name: string };
    subscriptionType?: { name: string };
    types: GraphQLType[];
  };
}

export interface GraphQLType {
  kind: string;
  name: string;
  description?: string;
  fields?: GraphQLField[];
  inputFields?: GraphQLInputValue[];
}

export interface GraphQLField {
  name: string;
  description?: string;
  args: GraphQLInputValue[];
  type: GraphQLTypeRef;
}

export interface GraphQLInputValue {
  name: string;
  description?: string;
  type: GraphQLTypeRef;
  defaultValue?: string;
}

export interface GraphQLTypeRef {
  kind: string;
  name?: string;
  ofType?: GraphQLTypeRef;
}
