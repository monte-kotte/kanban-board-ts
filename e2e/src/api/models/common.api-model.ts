/** Shape of a NestJS default error response body (thrown HttpExceptions). */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** A parsed API response: status code plus body. 204 responses have no body. */
export interface ApiResult<T> {
  status: number;
  body: T | ApiErrorBody | undefined;
}
