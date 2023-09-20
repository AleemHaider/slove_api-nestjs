import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, S3BucketService],
})
export class FileUploadModule {}
