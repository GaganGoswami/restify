// Test runner type definitions
export interface TestCase {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}

export interface TestSuite {
  id: string;
  name: string;
  collectionId?: string;
  tests: TestCase[];
  environment?: string;
  iterations?: number;
  delay?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  testId: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  assertions: AssertionResult[];
  error?: string;
  timestamp: Date;
}

export interface AssertionResult {
  name: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  message?: string;
}

export interface TestRunResult {
  suiteId: string;
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  tests: TestResult[];
  timestamp: Date;
}

export interface TestContext {
  request: import("./request").Request;
  response?: import("./request").HttpResponse;
  environment: Record<string, string>;
  globals: Record<string, unknown>;
}

export interface TestAssertion {
  expect(value: unknown): TestExpectation;
  pm: TestContext;
}

export interface TestExpectation {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toContain(expected: unknown): void;
  toHaveProperty(property: string, value?: unknown): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toHaveLength(expected: number): void;
}
