import { IsString, IsNotEmpty } from 'class-validator';

export class AddZoneDto {
  @IsString()
  @IsNotEmpty({ message: 'Bairro é obrigatório.' })
  neighborhood: string;
}
