import { AppFailure } from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../types/cep-error-code.type';

export class CepVo {
  private constructor(public readonly value: string) {}

  static create(rawCep: string): CepVo | AppFailure<CepErrorCode> {
    const sanitizedCep = rawCep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(sanitizedCep)) {
      return {
        ok: false,
        code: 'invalid_cep',
        message: 'CEP must contain exactly 8 digits',
        severity: 'low',
        source: 'cep',
      };
    }

    return new CepVo(sanitizedCep);
  }
}
