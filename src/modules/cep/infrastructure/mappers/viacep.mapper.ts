import { NotFoundException } from '@nestjs/common';
import { CepResult } from '../../domain/types/cep-result.type';

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export class ViaCepMapper {
  static toDomain(response: ViaCepResponse): CepResult {
    if (response.erro) {
      throw new NotFoundException('CEP not found');
    }

    return {
      cep: response.cep.replace(/\D/g, ''),
      street: response.logradouro,
      neighborhood: response.bairro,
      city: response.localidade,
      state: response.uf,
      provider: 'viacep',
    };
  }
}
