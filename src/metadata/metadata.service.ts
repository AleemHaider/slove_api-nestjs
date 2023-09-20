import { Injectable, Logger } from '@nestjs/common';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';

@Injectable()
export class MetadataService {
  private logger: Logger = new Logger(MetadataService.name);

  constructor(private readonly s3BucketService: S3BucketService) {}
  async getChatIds() {
    try {
      const res = await this.s3BucketService.readBucketFile(
        'config/config.json',
      );
      this.logger.log(res);
      return JSON.parse(res);
    } catch (e) {
      this.logger.error(e);
      return {};
    }
  }
}
