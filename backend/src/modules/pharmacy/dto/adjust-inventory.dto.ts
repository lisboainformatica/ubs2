import { IsString, IsNotEmpty, IsNumber, IsIn, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Medicamento é obrigatório.' })
  medicationId: string;

  @IsString()
  @IsNotEmpty({ message: 'Lote é obrigatório.' })
  lotId: string;

  @IsString()
  @IsNotEmpty({ message: 'UBS é obrigatória.' })
  ubsId: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantidade é obrigatória.' })
  quantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Tipo de ajuste é obrigatório.' })
  @IsIn(['LOSS', 'RETURN'])
  type: 'LOSS' | 'RETURN';

  @IsString()
  @IsOptional()
  remarks?: string;
}
