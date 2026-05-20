import { NotFoundException } from '@nestjs/common';
import { CepResult } from '../../domain/types/cep-result.type';

export type BrasilApiResponse = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export class BrasilApiMapper {
  static toDomain(response: BrasilApiResponse | null): CepResult {
    if (!response) {
      throw new NotFoundException('CEP not found');
    }

    return {
      cep: response.cep.replace(/\D/g, ''),
      street: response.street,
      neighborhood: response.neighborhood,
      city: response.city,
      state: response.state,
      provider: 'brasilapi',
    };
  }
}
