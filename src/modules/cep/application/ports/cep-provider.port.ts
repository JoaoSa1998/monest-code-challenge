import { AppResult } from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';

export type CepProviderName = string;

export interface CepProviderPort {
  readonly providerName: CepProviderName;
  findByCep(cep: string): Promise<AppResult<CepResult, CepErrorCode>>;
}
