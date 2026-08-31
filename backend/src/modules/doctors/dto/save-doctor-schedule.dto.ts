import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DoctorScheduleItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  intervalMin?: number;
}

export class SaveDoctorScheduleDto {
  @IsString()
  @IsNotEmpty()
  ubsId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DoctorScheduleItemDto)
  schedules: DoctorScheduleItemDto[];
}
