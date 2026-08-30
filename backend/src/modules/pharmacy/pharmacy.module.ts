import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PharmacyService],
  controllers: [PharmacyController],
  exports: [PharmacyService],
})
export class PharmacyModule {}
