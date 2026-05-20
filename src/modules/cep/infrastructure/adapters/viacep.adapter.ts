import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CepProviderName,
  CepProviderPort,
} from '../../application/ports/cep-provider.port';
import { CepResult } from '../../domain/types/cep-result.type';
import { ViaCepMapper, ViaCepResponse } from '../mappers/viacep.mapper';

@Injectable()
export class ViaCepAdapter implements CepProviderPort {
  readonly providerName: CepProviderName = 'viacep';

  constructor(private readonly configService: ConfigService) {}

  async findByCep(cep: string): Promise<CepResult> {
    const baseUrl = this.configService.getOrThrow<string>('cep.providers.viacep.baseUrl');
    const timeout = this.configService.get<number>('cep.requestTimeoutMs', 3000);

    try {
      const response = await fetch(`${baseUrl}/${cep}/json/`, {
        signal: AbortSignal.timeout(timeout),
      });

      if (response.status === 404) {
        throw new NotFoundException('CEP not found');
      }

      if (!response.ok) {
        throw new ServiceUnavailableException('ViaCEP is unavailable');
      }

      const payload = (await response.json()) as ViaCepResponse;
      return ViaCepMapper.toDomain(payload);
    } catch (error) {
      this.rethrowProviderError(error, 'ViaCEP');
    }
  }

  private rethrowProviderError(error: unknown, provider: string): never {
    if (
      error instanceof NotFoundException ||
      error instanceof ServiceUnavailableException
    ) {
      throw error;
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new ServiceUnavailableException(`${provider} timed out`);
    }

    throw new InternalServerErrorException(`Unexpected ${provider} error`);
  }
}
