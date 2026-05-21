import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { cepConfig } from './config/cep.config';
import { envValidationSchema } from './config/env.validation';
import { CepModule } from './modules/cep/cep.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
      load: [appConfig, cepConfig],
      validationSchema: envValidationSchema,
    }),
    CepModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
