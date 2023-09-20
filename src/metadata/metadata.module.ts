import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';

@Module({
  controllers: [MetadataController],
  providers: [MetadataService, S3BucketService],
})
export class MetadataModule {}
