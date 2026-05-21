import { ApiProperty } from '@nestjs/swagger';

export class CepResponseDto {
  @ApiProperty({ example: '69000000' })
  cep!: string;

  @ApiProperty({ example: 'Avenida Djalma Batista' })
  street!: string;

  @ApiProperty({ example: 'Chapada' })
  neighborhood!: string;

  @ApiProperty({ example: 'Manaus' })
  city!: string;

  @ApiProperty({ example: 'AM' })
  state!: string;

  @ApiProperty({ example: 'viacep' })
  provider!: string;
}
