import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  CEP_PROVIDER: Joi.string().valid('viacep', 'brasilapi').default('viacep'),
  VIACEP_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('https://viacep.com.br/ws'),
  BRASILAPI_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('https://brasilapi.com.br/api/cep/v1'),
});
