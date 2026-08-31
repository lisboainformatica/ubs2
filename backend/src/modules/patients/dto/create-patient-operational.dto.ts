import { IsString, IsNotEmpty, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../../shared/dto/address.dto';

export class CreatePatientOperationalDto {
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

  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty({ message: 'Endereço é obrigatório.' })
  address: AddressDto;
}
