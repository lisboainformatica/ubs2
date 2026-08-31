import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Status é obrigatório.' })
  @IsIn([
    'AGENDADA',
    'CONFIRMADA',
    'PACIENTE_CHEGOU',
    'EM_ATENDIMENTO',
    'ATENDIDA',
    'CANCELADA',
    'FALTA',
    'ENCAMINHADA',
  ])
  status: AppointmentStatus;
}
