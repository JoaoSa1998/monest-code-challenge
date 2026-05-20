import { registerAs } from '@nestjs/config';

export const cepConfig = registerAs('cep', () => ({
  provider: process.env.CEP_PROVIDER ?? 'viacep',
  providers: {
    viacep: {
      baseUrl: process.env.VIACEP_BASE_URL ?? 'https://viacep.com.br/ws',
    },
    brasilapi: {
      baseUrl:
        process.env.BRASILAPI_BASE_URL ??
        'https://brasilapi.com.br/api/cep/v1',
    },
  },
}));
