import { Module } from '@nestjs/common';
import { CepController } from './presentation/cep.controller';
import { GetCepUseCase } from './application/use-cases/get-cep.use-case';
import { ViaCepAdapter } from './infrastructure/adapters/viacep.adapter';
import { BrasilApiAdapter } from './infrastructure/adapters/brasilapi.adapter';
import { CepProviderFactory } from './infrastructure/providers/cep-provider.factory';
import { AsyncDelayService } from '../shared/infrastructure/services/async-delay.service';
import { AppFailureService } from '../shared/infrastructure/services/app-failure.service';

@Module({
  controllers: [CepController],
  providers: [
    GetCepUseCase,
    AsyncDelayService,
    AppFailureService,
    ViaCepAdapter,
    BrasilApiAdapter,
    CepProviderFactory,
  ],
})
export class CepModule {}
