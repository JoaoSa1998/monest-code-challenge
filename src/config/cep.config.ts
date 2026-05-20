import { registerAs } from '@nestjs/config';

export const cepConfig = registerAs('cep', () => ({
  provider: process.env.CEP_PROVIDER ?? 'viacep',
  attemptsLimit: Number(process.env.ATTEMPTS_LIMIT ?? 2),
  retryDelay: Number(process.env.RETRY_DELAY ?? 0),
  requestTimeoutMs: Number(process.env.CEP_REQUEST_TIMEOUT_MS ?? 3000),
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
