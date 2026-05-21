import { HttpException, HttpStatus } from '@nestjs/common';
import { AppFailure } from '../../domain/types/app-result.type';

const statusByErrorCode: Partial<Record<string, HttpStatus>> = {
  invalid_input: HttpStatus.BAD_REQUEST,
  invalid_cep: HttpStatus.BAD_REQUEST,
  not_found: HttpStatus.NOT_FOUND,
  provider_timeout: HttpStatus.SERVICE_UNAVAILABLE,
  provider_unavailable: HttpStatus.SERVICE_UNAVAILABLE,
  unexpected_error: HttpStatus.INTERNAL_SERVER_ERROR,
};

export class AppFailureHttpException extends HttpException {
  constructor(failure: AppFailure<string>, status: HttpStatus) {
    super(failure, status);
  }

  static fromFailure<TCode extends string>(
    failure: AppFailure<TCode>,
  ): AppFailureHttpException {
    return new AppFailureHttpException(
      failure,
      statusByErrorCode[failure.code] ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
