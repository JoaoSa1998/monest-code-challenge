import { ErrorSeverity } from './error-severity.type';

export type AppErrorCode =
  | 'invalid_input'
  | 'not_found'
  | 'provider_timeout'
  | 'provider_unavailable'
  | 'unexpected_error';

export type AppSuccess<TData> = {
  ok: true;
  data: TData;
};

export type AppFailure<TCode extends string = AppErrorCode> = {
  ok: false;
  code: TCode;
  message: string;
  severity: ErrorSeverity;
  source?: string;
};

export type AppResult<TData, TCode extends string = AppErrorCode> =
  | AppSuccess<TData>
  | AppFailure<TCode>;
