import { BadRequestException } from '@nestjs/common';

export class CepVo {
  private constructor(public readonly value: string) {}

  static create(rawCep: string): CepVo {
    const sanitizedCep = rawCep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(sanitizedCep)) {
      throw new BadRequestException('CEP must contain exactly 8 digits');
    }

    return new CepVo(sanitizedCep);
  }
}
