import { AppResult } from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
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
  static toDomain(response: ViaCepResponse): AppResult<CepResult, CepErrorCode> {
    if (response.erro) {
      return {
        ok: false,
        code: 'not_found',
        message: 'CEP not found',
        severity: 'low',
        source: 'viacep',
      };
    }

    return {
      ok: true,
      data: {
      cep: response.cep.replace(/\D/g, ''),
      street: response.logradouro,
      neighborhood: response.bairro,
      city: response.localidade,
      state: response.uf,
      provider: 'viacep',
      },
    };
  }
}
