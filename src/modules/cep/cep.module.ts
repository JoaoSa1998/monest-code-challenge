import { Module } from '@nestjs/common';
import { CepController } from './cep.controller';
import { CepService } from './cep.service';

@Module({
  controllers: [CepController],
  providers: [CepService]
})
export class CepModule {}
