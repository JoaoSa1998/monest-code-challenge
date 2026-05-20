import { Test, TestingModule } from '@nestjs/testing';
import { CepController } from './cep.controller';

describe('CepController', () => {
  let controller: CepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CepController],
    }).compile();

    controller = module.get<CepController>(CepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
