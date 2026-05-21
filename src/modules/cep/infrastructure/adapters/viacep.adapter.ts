import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CepProviderName,
  CepProviderPort,
} from '../../application/ports/cep-provider.port';
import {
  AppResult,
} from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';
import { AsyncDelayService } from '../../../shared/infrastructure/services/async-delay.service';
import { AppFailureService } from '../../../shared/infrastructure/services/app-failure.service';
import { ViaCepMapper, ViaCepResponse } from '../mappers/viacep.mapper';

@Injectable()
export class ViaCepAdapter implements CepProviderPort {
  readonly providerName: CepProviderName = 'viacep';

  constructor(
    private readonly configService: ConfigService,
    private readonly asyncDelayService: AsyncDelayService,
    private readonly appFailureService: AppFailureService,
  ) {}

  async findByCep(cep: string): Promise<AppResult<CepResult, CepErrorCode>> {
    const baseUrl = this.configService.getOrThrow<string>(
      'cep.providers.viacep.baseUrl',
    );
    const simulatedDelayMs = this.configService.get<number>(
      'cep.providers.viacep.simulatedDelayMs',
      0,
    );
    const timeout = this.configService.get<number>('cep.requestTimeoutMs', 3000);
    const signal = AbortSignal.timeout(timeout);

    try {
      await this.asyncDelayService.wait(simulatedDelayMs, signal);

      const response = await fetch(`${baseUrl}/${cep}/json/`, {
        signal,
      });

      if (response.status === 404) {
        return this.appFailureService.createFailure({
          code: 'not_found',
          message: 'CEP not found',
          severity: 'low',
          source: this.providerName,
        });
      }

      if (!response.ok) {
        return this.appFailureService.createFailure({
          code: 'provider_unavailable',
          message: 'ViaCEP is unavailable',
          severity: 'high',
          source: this.providerName,
        });
      }

      const payload = (await response.json()) as ViaCepResponse;
      return ViaCepMapper.toDomain(payload);
    } catch (error) {
      return this.appFailureService.mapTransportError<CepErrorCode>(error, {
        source: this.providerName,
        timeoutCode: 'provider_timeout',
        timeoutMessage: 'ViaCEP timed out',
        unexpectedCode: 'unexpected_error',
        unexpectedMessage: 'Unexpected ViaCEP error',
      });
    }
  }
}
