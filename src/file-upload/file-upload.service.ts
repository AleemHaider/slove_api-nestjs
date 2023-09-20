import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Express } from 'express';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { UserEntity } from '../entity/user.entity';
import { SingleFileUploadDto } from './dto/request/single-file-upload.dto';
import {
  MULTIPLE_FILE_UPLOAD_TYPE,
  SINGLE_FILE_UPLOAD_TYPE,
} from '../util/constant';
import ERROR_MESSAGES from '../util/error-messages';
import { MultipleFileUploadDto } from './dto/request/multiple-file-upload.dto';

@Injectable()
export class FileUploadService {
  private logger: Logger = new Logger(FileUploadService.name);

  constructor(private readonly s3BucketService: S3BucketService) {}

  async uploadSingleFile(
    currentUser: UserEntity,
    file: Express.Multer.File,
    dto: SingleFileUploadDto,
  ) {
    // this.logger.log({ currentUser });
    try {
      const folderName = `user-${currentUser.id}`;

      if (dto.type === SINGLE_FILE_UPLOAD_TYPE.PROFILE_IMAGE) {
        const data = await this.s3BucketService.uploadProfileImage(
          file,
          folderName,
        );
        return data.key;
      }
      else if(dto.type === SINGLE_FILE_UPLOAD_TYPE.AUDIO_URL)
      {
        const data = await this.s3BucketService.uploadProfileImage(
          file,
          folderName,
        );
        return data.key;

      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadMultipleFile(
    currentUser: UserEntity,
    files: Array<Express.Multer.File>,
    dto: MultipleFileUploadDto,
  ) {
    try {
      if (dto.type === MULTIPLE_FILE_UPLOAD_TYPE.GALLERY) {
        const folderName = `user-${currentUser.id}`;
        return await this.s3BucketService.uploadGalleryFiles(files, folderName);
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSignedFile(key: string) {
    // this.logger.log({ key });
    this.logger.log('image sign');
    return await this.s3BucketService.getSingedFile(key);
  }
}
