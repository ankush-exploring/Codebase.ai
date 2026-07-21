export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT_EXCEEDED';

export interface AppErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    errors?: Record<string, string[]>;
  };
}