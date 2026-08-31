import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Paciente é obrigatório.' })
  patientId: string;

  @IsString()
  @IsNotEmpty({ message: 'Médico é obrigatório.' })
  doctorId: string;

  @IsString()
  @IsNotEmpty({ message: 'Especialidade é obrigatória.' })
  specialtyId: string;

  @IsString()
  @IsNotEmpty({ message: 'UBS é obrigatória.' })
  ubsId: string;

  @IsString()
  @IsNotEmpty({ message: 'Data e hora da consulta são obrigatórias.' })
  dateTime: string;
}
