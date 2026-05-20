import { CepResult } from '../../domain/types/cep-result.type';

export type CepProviderName = 'viacep' | 'brasilapi';

export interface CepProviderPort {
  readonly providerName: CepProviderName;
  findByCep(cep: string): Promise<CepResult>;
}
