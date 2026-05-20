import { Injectable } from '@nestjs/common';
import { CepResponseDto } from '../dto/cep-response.dto';
import { CepVo } from '../../domain/value-objects/cep.vo';
import { CepProviderFactory } from '../../infrastructure/providers/cep-provider.factory';

@Injectable()
export class GetCepUseCase {
  constructor(private readonly cepProviderFactory: CepProviderFactory) {}

  async execute(rawCep: string): Promise<CepResponseDto> {
    const cep = CepVo.create(rawCep);
    const result = await this.cepProviderFactory.findByCep(cep.value);

    return {
      cep: result.cep,
      street: result.street,
      neighborhood: result.neighborhood,
      city: result.city,
      state: result.state,
      provider: result.provider,
    };
  }
}
