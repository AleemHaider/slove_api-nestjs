import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { ContactEntity } from '../entity/contact.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ContactEntity])],
  controllers: [ContactController],
  providers: [ContactService, FileUploadService, S3BucketService],
})
export class ContactModule {}
