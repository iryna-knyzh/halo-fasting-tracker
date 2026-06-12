import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FastingSession } from '../entities/fasting-session.entity';
import { FastingService } from './fasting.service';
import { FastingController } from './fasting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FastingSession])],
  controllers: [FastingController],
  providers: [FastingService],
})
export class FastingModule {}
