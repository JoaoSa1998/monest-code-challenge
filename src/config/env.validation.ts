import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  CEP_PROVIDER: Joi.string().valid('viacep', 'brasilapi').default('viacep'),
  ATTEMPTS_LIMIT: Joi.number().integer().min(1).default(2),
  RETRY_DELAY: Joi.number().integer().min(0).default(0),
  CEP_REQUEST_TIMEOUT_MS: Joi.number().integer().min(1).default(3000),
  CEP_PROVIDER_FAILURE_STREAK_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(2),
  CEP_PROVIDER_COOLDOWN_MS: Joi.number().integer().min(0).default(30000),
  VIACEP_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('https://viacep.com.br/ws'),
  VIACEP_SIMULATED_DELAY_MS: Joi.number().integer().min(0).default(0),
  BRASILAPI_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('https://brasilapi.com.br/api/cep/v1'),
  BRASILAPI_SIMULATED_DELAY_MS: Joi.number().integer().min(0).default(0),
});
