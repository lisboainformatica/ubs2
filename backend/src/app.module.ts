import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UbsModule } from './modules/ubs/ubs.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UbsModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    PharmacyModule,
    ReportsModule,
  ],
})
export class AppModule {}
