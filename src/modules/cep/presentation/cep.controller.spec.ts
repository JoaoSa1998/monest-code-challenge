import { Test, TestingModule } from '@nestjs/testing';
import { CepController } from './cep.controller';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';

describe('CepController', () => {
  let controller: CepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CepController],
      providers: [
        {
          provide: GetCepUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CepController>(CepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
