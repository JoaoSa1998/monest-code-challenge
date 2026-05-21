import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;
}

@ApiTags('app')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Check if the API is healthy' })
  @ApiOkResponse({
    description: 'API is up and running',
    type: HealthResponseDto,
  })
  @Get('health')
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
    };
  }
}
