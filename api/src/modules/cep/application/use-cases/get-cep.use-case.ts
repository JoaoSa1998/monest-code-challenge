import { Injectable } from '@nestjs/common';
import { CepResponseDto } from '../dto/cep-response.dto';
import { CepVo } from '../../domain/value-objects/cep.vo';
import { CepProviderFactory } from '../../infrastructure/providers/cep-provider.factory';
import { AppResult } from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';

@Injectable()
export class GetCepUseCase {
  constructor(private readonly cepProviderFactory: CepProviderFactory) {}

  async execute(rawCep: string): Promise<AppResult<CepResult, CepErrorCode>> {
    const cep = CepVo.create(rawCep);

    if ('ok' in cep) {
      return cep;
    }

    const result = await this.cepProviderFactory.findByCep(cep.value);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      data: {
        cep: result.data.cep,
        street: result.data.street,
        neighborhood: result.data.neighborhood,
        city: result.data.city,
        state: result.data.state,
        provider: result.data.provider,
      },
    };
  }
}
