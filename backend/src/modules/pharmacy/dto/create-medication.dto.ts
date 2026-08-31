import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do medicamento é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Forma farmacêutica é obrigatória.' })
  dosageForm: string;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @IsOptional()
  targetStock?: number;
}
