import { Injectable, Logger } from '@nestjs/common';
import { AppFailure } from '../../domain/types/app-result.type';

type BuildFailureParams<TCode extends string> = {
  code: TCode;
  message: string;
  severity: AppFailure<TCode>['severity'];
  source: string;
};

type MapErrorParams<TCode extends string> = {
  source: string;
  timeoutCode: TCode;
  timeoutMessage: string;
  unexpectedCode: TCode;
  unexpectedMessage: string;
};

@Injectable()
export class AppFailureService {
  private readonly logger = new Logger(AppFailureService.name);

  createFailure<TCode extends string>({
    code,
    message,
    severity,
    source,
  }: BuildFailureParams<TCode>): AppFailure<TCode> {
    const failure: AppFailure<TCode> = {
      ok: false,
      code,
      message,
      severity,
      source,
    };

    this.logFailure(failure);
    return failure;
  }

  mapTransportError<TCode extends string>(
    error: unknown,
    params: MapErrorParams<TCode>,
  ): AppFailure<TCode> {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return this.createFailure({
        code: params.timeoutCode,
        message: params.timeoutMessage,
        severity: 'high',
        source: params.source,
      });
    }

    return this.createFailure({
      code: params.unexpectedCode,
      message: params.unexpectedMessage,
      severity: 'critical',
      source: params.source,
    });
  }

  private logFailure<TCode extends string>(failure: AppFailure<TCode>): void {
    const context = `[${failure.severity}] [${failure.source}] ${failure.message}`;

    if (failure.severity === 'low') {
      this.logger.warn(context);
      return;
    }

    this.logger.error(context);
  }
}
