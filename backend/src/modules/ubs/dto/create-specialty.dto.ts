import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da especialidade é obrigatório.' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
