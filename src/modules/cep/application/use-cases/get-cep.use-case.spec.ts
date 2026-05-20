import { Test, TestingModule } from '@nestjs/testing';
import { GetCepUseCase } from './get-cep.use-case';
import { CepProviderFactory } from '../../infrastructure/providers/cep-provider.factory';

describe('GetCepUseCase', () => {
  let useCase: GetCepUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCepUseCase,
        {
          provide: CepProviderFactory,
          useValue: {
            findByCep: jest.fn().mockResolvedValue({
              cep: '69000000',
              street: 'Rua Example',
              neighborhood: 'Centro',
              city: 'Manaus',
              state: 'AM',
              provider: 'viacep',
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCepUseCase>(GetCepUseCase);
  });

  it('should normalize the cep and return the provider response', async () => {
    await expect(useCase.execute('69000-000')).resolves.toEqual({
      cep: '69000000',
      street: 'Rua Example',
      neighborhood: 'Centro',
      city: 'Manaus',
      state: 'AM',
      provider: 'viacep',
    });
  });
});
