/** Named HTTP status codes, mirroring NestJS's own `HttpStatus` enum usage in the backend. */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const;

/** Syntactically valid UUID that never corresponds to a real record — for asserting 404s. */
export const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';
