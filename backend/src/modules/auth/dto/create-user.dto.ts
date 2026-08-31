import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DoctorDetailsDto {
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  crm: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  specialtyIds: string[];

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ubsIds: string[];
}

export class CreateUserDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password?: string;

  @IsString()
  @IsOptional()
  passwordHash?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Papel do usuário é obrigatório.' })
  role: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DoctorDetailsDto)
  doctorDetails?: DoctorDetailsDto;
}
