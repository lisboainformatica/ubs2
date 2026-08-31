import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsString()
  @IsNotEmpty()
  medicationId: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsInt()
  @Min(1)
  qtyRequested: number;
}

export class ExamRequestItemDto {
  @IsString()
  @IsNotEmpty()
  examName: string;
}

export class ReferralDto {
  @IsString()
  @IsNotEmpty()
  destinationUbsId: string;

  @IsString()
  @IsNotEmpty()
  specialtyId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty({ message: 'Consulta é obrigatória.' })
  appointmentId: string;

  @IsString()
  @IsNotEmpty({ message: 'Evolução é obrigatória.' })
  evolution: string;

  @IsString()
  @IsNotEmpty({ message: 'Diagnóstico é obrigatório.' })
  diagnosis: string;

  @IsString()
  @IsNotEmpty({ message: 'Conduta é obrigatória.' })
  conduct: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescriptions?: PrescriptionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamRequestItemDto)
  examRequests?: ExamRequestItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferralDto)
  referral?: ReferralDto;
}
