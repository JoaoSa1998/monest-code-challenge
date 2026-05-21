import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
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
import type { Response } from 'express';
import { CepResponseDto } from '../application/dto/cep-response.dto';
import { GetCepUseCase } from '../application/use-cases/get-cep.use-case';
import { AppFailure } from '../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../domain/types/cep-error-code.type';

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
  async getCep(
    @Param('cep') cep: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CepResponseDto | AppFailure<CepErrorCode>> {
    const result = await this.getCepUseCase.execute(cep);

    if (!result.ok) {
      return result;
    }

    return result.data;
  }

 
}
