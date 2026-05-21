# Teste Tecnico - Desenvolvedor

## O problema

Voce precisa criar uma API que consulta CEP.

O desafio nao e apenas buscar dados, mas garantir resiliencia ao depender de servicos externos que podem falhar, ficar lentos ou retornar respostas inconsistentes.

## APIs disponiveis

- ViaCEP: `https://viacep.com.br/ws/{cep}/json/`
- BrasilAPI: `https://brasilapi.com.br/api/cep/v1/{cep}`

## Requisitos

### Endpoint

`GET /cep/{cep}`

### Comportamento esperado

- Alternar entre as duas APIs
- Tentar automaticamente o outro provider quando houver falha
- Retornar um contrato unico, independente do provider utilizado

## O que queremos ver

1. **Abstracao**: como os providers externos foram isolados e como seria simples adicionar um terceiro provider
2. **Resiliencia**: como a aplicacao reage a timeout, indisponibilidade e falhas simultaneas
3. **Observabilidade**: como identificar rapidamente falhas em producao
4. **Tratamento de erros**: diferenciar timeout, erro de integracao, CEP invalido e outros cenarios

## Stack

NestJS + TypeScript

## O que nao estamos avaliando

- Frontend
- Banco de dados
- Deploy
- Cobertura de testes em 100%

## Variaveis de ambiente

O projeto utiliza um arquivo `.env` para controlar ambiente, porta, provider padrao e regras de resiliencia.

Exemplo:

```env
NODE_ENV=development
PORT=3000
CEP_PROVIDER=viacep
ATTEMPTS_LIMIT=2
RETRY_DELAY=0
CEP_REQUEST_TIMEOUT_MS=3000
CEP_PROVIDER_FAILURE_STREAK_LIMIT=2
CEP_PROVIDER_COOLDOWN_MS=30000
VIACEP_BASE_URL=https://viacep.com.br/ws
VIACEP_SIMULATED_DELAY_MS=4000
BRASILAPI_BASE_URL=https://brasilapi.com.br/api/cep/v1
BRASILAPI_SIMULATED_DELAY_MS=0
```

### Documentacao de cada variavel

- `NODE_ENV`: define o ambiente de execucao. Valores aceitos: `development`, `production` e `test`.
- `PORT`: porta em que a API sera iniciada.
- `CEP_PROVIDER`: provider inicial ou preferencial para consulta de CEP. Valores aceitos: `viacep` e `brasilapi`.
- `ATTEMPTS_LIMIT`: quantidade maxima de tentativas de consulta antes de retornar falha.
- `RETRY_DELAY`: intervalo, em milissegundos, entre tentativas.
- `CEP_REQUEST_TIMEOUT_MS`: tempo maximo, em milissegundos, para aguardar resposta de um provider antes de considerar timeout.
- `CEP_PROVIDER_FAILURE_STREAK_LIMIT`: quantidade de falhas consecutivas que um provider pode acumular antes de entrar em cooldown.
- `CEP_PROVIDER_COOLDOWN_MS`: tempo, em milissegundos, que um provider permanece temporariamente evitado apos atingir o limite de falhas.
- `VIACEP_BASE_URL`: URL base usada para consultar o provider ViaCEP.
- `VIACEP_SIMULATED_DELAY_MS`: atraso artificial, em milissegundos, aplicado nas chamadas do ViaCEP para testes locais de resiliencia.
- `BRASILAPI_BASE_URL`: URL base usada para consultar o provider BrasilAPI.
- `BRASILAPI_SIMULATED_DELAY_MS`: atraso artificial, em milissegundos, aplicado nas chamadas da BrasilAPI para testes locais de resiliencia.

## Como rodar o projeto

### Rodando localmente

1. Entre na pasta da API:

```bash
cd api
```

2. Instale as dependencias:

```bash
npm install
```

3. Inicie em modo desenvolvimento:

```bash
npm run start:dev
```

4. Acesse a aplicacao:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### Rodando com Docker Compose

Na raiz do repositorio, execute:

```bash
docker compose up --build
```

Depois disso, a API ficara disponivel em:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## Como entregar

Fork este repositorio, implemente a solucao e envie o link para [matheus.morett@monest.com.br](mailto:matheus.morett@monest.com.br) com o assunto **Teste Dev - Monest**.

Se o repositorio for privado, adicione `matheusmorett2` como colaborador.
