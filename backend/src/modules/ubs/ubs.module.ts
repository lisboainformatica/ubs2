import { Module } from '@nestjs/common';
import { UbsService } from './ubs.service';
import { UbsController } from './ubs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [UbsService],
  controllers: [UbsController],
  exports: [UbsService],
})
export class UbsModule {}
