import { CepProviderName } from '../../application/ports/cep-provider.port';

export type CepResult = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  provider: CepProviderName;
};
