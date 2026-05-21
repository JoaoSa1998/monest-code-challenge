import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CepProviderName,
  CepProviderPort,
} from '../../application/ports/cep-provider.port';
import {
  AppFailure,
  AppResult,
} from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';
import { ViaCepMapper, ViaCepResponse } from '../mappers/viacep.mapper';

@Injectable()
export class ViaCepAdapter implements CepProviderPort {
  readonly providerName: CepProviderName = 'viacep';
  private readonly logger = new Logger(ViaCepAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async findByCep(cep: string): Promise<AppResult<CepResult, CepErrorCode>> {
    const baseUrl = this.configService.getOrThrow<string>(
      'cep.providers.viacep.baseUrl',
    );
    const timeout = this.configService.get<number>('cep.requestTimeoutMs', 3000);

    try {
      const response = await fetch(`${baseUrl}/${cep}/json/`, {
        signal: AbortSignal.timeout(timeout),
      });

      if (response.status === 404) {
        return this.buildFailure('not_found', 'CEP not found', 'low');
      }

      if (!response.ok) {
        return this.buildFailure(
          'provider_unavailable',
          'ViaCEP is unavailable',
          'high',
        );
      }

      const payload = (await response.json()) as ViaCepResponse;
      return ViaCepMapper.toDomain(payload);
    } catch (error) {
      return this.handleProviderError(error, 'ViaCEP');
    }
  }

  private handleProviderError(
    error: unknown,
    provider: string,
  ): AppFailure<CepErrorCode> {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return this.buildFailure(
        'provider_timeout',
        `${provider} timed out`,
        'high',
      );
    }

    return this.buildFailure(
      'unexpected_error',
      `Unexpected ${provider} error`,
      'critical',
    );
  }

  private buildFailure(
    code: AppFailure<CepErrorCode>['code'],
    message: string,
    severity: AppFailure<CepErrorCode>['severity'],
  ): AppFailure<CepErrorCode> {
    const failure: AppFailure<CepErrorCode> = {
      ok: false,
      code,
      message,
      severity,
      source: this.providerName,
    };

    this.logFailure(failure);
    return failure;
  }

  private logFailure(failure: AppFailure<CepErrorCode>): void {
    const context = `[${failure.severity}] [${failure.source}] ${failure.message}`;

    if (failure.severity === 'low') {
      this.logger.warn(context);
      return;
    }

    this.logger.error(context);
  }
}
