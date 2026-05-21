import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CepController } from './cep.controller';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';
import { AppFailureHttpException } from '../../shared/presentation/exceptions/app-failure-http.exception';

describe('CepController', () => {
  let controller: CepController;
  let getCepUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    getCepUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CepController],
      providers: [
        {
          provide: GetCepUseCase,
          useValue: getCepUseCase,
        },
      ],
    }).compile();

    controller = module.get<CepController>(CepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the CEP payload when the use case succeeds', async () => {
    const cepResponse = {
      cep: '69000000',
      street: 'Rua Example',
      neighborhood: 'Centro',
      city: 'Manaus',
      state: 'AM',
      provider: 'viacep',
    };

    getCepUseCase.execute.mockResolvedValue({
      ok: true,
      data: cepResponse,
    });

    await expect(controller.getCep('69000000')).resolves.toEqual(cepResponse);
  });

  it('throws a shared HTTP exception when the use case fails', async () => {
    getCepUseCase.execute.mockResolvedValue({
      ok: false,
      code: 'invalid_cep',
      message: 'CEP must contain exactly 8 digits',
      severity: 'low',
      source: 'CepVo',
    });

    await expect(controller.getCep('123')).rejects.toMatchObject({
      constructor: AppFailureHttpException,
      status: HttpStatus.BAD_REQUEST,
      response: {
        ok: false,
        code: 'invalid_cep',
      },
    });
  });
});
