import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CepResponseDto } from '../application/dto/cep-response.dto';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';
import { AppFailureHttpException } from '../../shared/presentation/exceptions/app-failure-http.exception';

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
  @ApiServiceUnavailableResponse({
    description: 'CEP providers are unavailable or timed out',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected CEP lookup error',
  })
  @Get(':cep')
  async getCep(@Param('cep') cep: string): Promise<CepResponseDto> {
    const result = await this.getCepUseCase.execute(cep);

    if (!result.ok) {
      throw AppFailureHttpException.fromFailure(result);
    }

    return result.data;
  }
}
