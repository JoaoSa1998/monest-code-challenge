import { Controller, Get, Param } from '@nestjs/common';
import { CepResponseDto } from '../application/dto/cep-response.dto';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';

@Controller('cep')
export class CepController {
  constructor(private readonly getCepUseCase: GetCepUseCase) {}

  @Get(':cep')
  async getCep(@Param('cep') cep: string): Promise<CepResponseDto> {
    return this.getCepUseCase.execute(cep);
  }
}
