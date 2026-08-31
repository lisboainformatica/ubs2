import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddLotDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicamento é obrigatório.' })
  medicationId: string;

  @IsString()
  @IsNotEmpty({ message: 'Número do lote é obrigatório.' })
  lotNumber: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantidade física é obrigatória.' })
  quantityPhysical: number;

  @IsString()
  @IsNotEmpty({ message: 'Data de validade é obrigatória.' })
  expirationDate: string;

  @IsString()
  @IsOptional()
  manufacturingDate?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsNotEmpty({ message: 'UBS é obrigatória.' })
  ubsId: string;
}
