import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CepProviderName,
  CepProviderPort,
} from '../../application/ports/cep-provider.port';
import { CepResult } from '../../domain/types/cep-result.type';
import { BrasilApiAdapter } from '../adapters/brasilapi.adapter';
import { ViaCepAdapter } from '../adapters/viacep.adapter';

@Injectable()
export class CepProviderFactory {
  private readonly providers: Record<CepProviderName, CepProviderPort>;
  private readonly providerNames: CepProviderName[];
  private nextProviderIndex = 0;

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

    const preferredProvider = this.configService.get<CepProviderName>(
      'cep.provider',
      'viacep',
    );

    const preferredProviderIndex = this.providerNames.indexOf(preferredProvider);
    this.nextProviderIndex =
      preferredProviderIndex >= 0 ? preferredProviderIndex : 0;
  }

  async findByCep(cep: string): Promise<CepResult> {
    const attemptsLimit = this.configService.get<number>('cep.attemptsLimit', 2);
    const retryDelay = this.configService.get<number>('cep.retryDelay', 0);
    const providerOrder = this.getProviderOrder();
    let lastUnavailableError: ServiceUnavailableException | null = null;
    let notFoundCount = 0;

    for (let attempt = 0; attempt < attemptsLimit; attempt++) {
      const provider = providerOrder[attempt % providerOrder.length];

      try {
        return await provider.findByCep(cep);
      } catch (error) {
        if (error instanceof NotFoundException) {
          notFoundCount += 1;
        } else if (error instanceof ServiceUnavailableException) {
          lastUnavailableError = error;
        } else {
          throw error;
        }
      }

      if (attempt < attemptsLimit - 1 && retryDelay > 0) {
        await this.delay(retryDelay);
      }
    }

    if (notFoundCount === attemptsLimit) {
      throw new NotFoundException('CEP not found');
    }

    throw lastUnavailableError ?? new ServiceUnavailableException('CEP providers are unavailable');
  }

  private getProviderOrder(): CepProviderPort[] {
    const startIndex = this.nextProviderIndex;

    this.nextProviderIndex =
      (this.nextProviderIndex + 1) % this.providerNames.length;

    return this.providerNames.map((_, index) => {
      const rotatedIndex = (startIndex + index) % this.providerNames.length;
      return this.providers[this.providerNames[rotatedIndex]];
    });
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
