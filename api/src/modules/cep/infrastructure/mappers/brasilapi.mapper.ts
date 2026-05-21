import { AppResult } from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';

export type BrasilApiResponse = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export class BrasilApiMapper {
  static toDomain(
    response: BrasilApiResponse | null,
  ): AppResult<CepResult, CepErrorCode> {
    if (!response) {
      return {
        ok: false,
        code: 'not_found',
        message: 'CEP not found',
        severity: 'low',
        source: 'brasilapi',
      };
    }

    return {
      ok: true,
      data: {
      cep: response.cep.replace(/\D/g, ''),
      street: response.street,
      neighborhood: response.neighborhood,
      city: response.city,
      state: response.state,
      provider: 'brasilapi',
      },
    };
  }
}
