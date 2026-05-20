import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CepModule } from './cep/cep.module';

@Module({
  imports: [CepModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
