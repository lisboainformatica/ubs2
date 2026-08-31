import { IsString, IsNotEmpty } from 'class-validator';

export class DispenseMedicationDto {
  @IsString()
  @IsNotEmpty({ message: 'ID do item da receita é obrigatório.' })
  prescriptionItemId: string;
}
