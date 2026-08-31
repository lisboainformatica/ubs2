import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from '../../../shared/dto/address.dto';

export class CreateUbsDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da UBS é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Código da UBS é obrigatório.' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório.' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  email: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Latitude é obrigatória.' })
  latitude: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Longitude é obrigatória.' })
  longitude: number;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty({ message: 'Endereço é obrigatório.' })
  address: AddressDto;

  @IsString({ each: true })
  @IsOptional()
  specialtyIds?: string[];

  @IsString({ each: true })
  @IsOptional()
  zones?: string[];
}
