import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CepResponseDto } from '../application/dto/cep-response.dto';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';

@ApiTags('cep')
@Controller('cep')
export class CepController {
  constructor(private readonly getCepUseCase: GetCepUseCase) {}

  @ApiOperation({ summary: 'Lookup an address by CEP' })
  @ApiParam({
    name: 'cep',
    description: 'Brazilian CEP with 8 digits, with or without mask',
    example: '69000000',
  })
  @ApiOkResponse({
    description: 'CEP found successfully',
    type: CepResponseDto,
  })
  @ApiBadRequestResponse({ description: 'CEP must contain exactly 8 digits' })
  @ApiNotFoundResponse({ description: 'CEP not found' })
  @Get(':cep')
  async getCep(@Param('cep') cep: string): Promise<CepResponseDto> {
    return this.getCepUseCase.execute(cep);
  }
}
