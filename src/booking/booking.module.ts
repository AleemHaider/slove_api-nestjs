import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../entity/booking.entity';
import { UserEntity } from '../entity/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { BookingContractEntity } from '../entity/booking-contract.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { EventEntity } from '../entity/event.entity';
import { CalendarEntity } from '../entity/calendar.entity';
import { UserTypeEntity } from '../entity/user-type.entity';
import { UserModule } from '../user/user.module';
import { TicketEntity } from '../entity/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      UserEntity,
      BookingContractEntity,
      MusicGenreEntity,
      EventEntity,
      CalendarEntity,
      UserTypeEntity,
      TicketEntity,
    ]),
    UserModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, FileUploadService, S3BucketService],
})
export class BookingModule {}
