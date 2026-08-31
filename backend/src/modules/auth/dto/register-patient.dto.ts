import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../../shared/dto/address.dto';

export class RegisterPatientDto {
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
  @IsNotEmpty({ message: 'CPF é obrigatório.' })
  cpf: string;

  @IsString()
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória.' })
  birthDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório.' })
  phone: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty({ message: 'Endereço é obrigatório.' })
  address: AddressDto;
}
