import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEntity } from '../entity/calendar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEntity])],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
