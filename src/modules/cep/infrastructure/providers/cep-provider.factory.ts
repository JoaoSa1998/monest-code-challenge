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
import { BrasilApiAdapter } from '../adapters/brasilapi.adapter';
import { ViaCepAdapter } from '../adapters/viacep.adapter';

@Injectable()
export class CepProviderFactory {
  private readonly providers: Record<CepProviderName, CepProviderPort>;
  private readonly providerNames: CepProviderName[];
  private nextProviderIndex = 0;
  private readonly logger = new Logger(CepProviderFactory.name);

  constructor(
    private readonly configService: ConfigService,
    viaCepAdapter: ViaCepAdapter,
    brasilApiAdapter: BrasilApiAdapter,
  ) {
    this.providers = {
      viacep: viaCepAdapter,
      brasilapi: brasilApiAdapter,
    };
    this.providerNames = Object.keys(this.providers);


    //Preference  provider defined in the config :P

    const preferredProvider = this.configService.get<CepProviderName>(
      'cep.provider',
      'viacep',
    );

    const preferredProviderIndex = this.providerNames.indexOf(preferredProvider);
    this.nextProviderIndex =preferredProviderIndex >= 0 ? preferredProviderIndex : 0;
  }

  async findByCep(cep: string): Promise<AppResult<CepResult, CepErrorCode>> {
    const attemptsLimit = this.configService.get<number>('cep.attemptsLimit', 2);
    const retryDelay = this.configService.get<number>('cep.retryDelay', 0);
    const providerOrder = this.getProviderOrder();
    let lastFailure: AppFailure<CepErrorCode> | null = null;
    let notFoundCount = 0;

    for (let attempt = 0; attempt < attemptsLimit; attempt++) {
      const provider = providerOrder[attempt % providerOrder.length];
      const result = await provider.findByCep(cep);

      if (result.ok) {
        return result;
      }

      lastFailure = result;

      if (result.code === 'not_found') {
        notFoundCount += 1;
      }

      if (attempt < attemptsLimit - 1 && retryDelay > 0) {
        await this.delay(retryDelay);
      }
    }

    if (notFoundCount === attemptsLimit) {
      const failure: AppFailure<CepErrorCode> = {
        ok: false,
        code: 'not_found',
        message: 'CEP not found',
        severity: 'low',
        source: 'cep',
      };
      this.logger.warn(
        `[${failure.severity}] CEP lookup ended with not_found after ${attemptsLimit} attempts`,
      );
      return failure;
    }

    const fallbackFailure =
      lastFailure ??
      ({
        ok: false,
        code: 'provider_unavailable',
        message: 'CEP providers are unavailable',
        severity: 'high',
        source: 'cep',
      } satisfies AppFailure<CepErrorCode>);

    this.logger.error(
      `[${fallbackFailure.severity}] CEP lookup failed after ${attemptsLimit} attempts`,
    );
    return fallbackFailure;
  }

  private getProviderOrder(): CepProviderPort[] {
    const startIndex = this.nextProviderIndex;

    this.nextProviderIndex =(this.nextProviderIndex + 1) % this.providerNames.length;

    return this.providerNames.map((_, index) => {
      const rotatedIndex = (startIndex + index) % this.providerNames.length;
      return this.providers[this.providerNames[rotatedIndex]];
    });
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
