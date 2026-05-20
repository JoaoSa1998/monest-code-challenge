export class CepResponseDto {
  cep!: string;
  street!: string;
  neighborhood!: string;
  city!: string;
  state!: string;
  provider!: 'viacep' | 'brasilapi';
}
