import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { parse } from 'path';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3BucketService {
  private logger: Logger = new Logger(S3BucketService.name);
  readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: configService.get('AWS_REGION'),
    });
  }

  setFilename(uploadedFile: Express.Multer.File, userExt: string): string {
    const fileName = parse(uploadedFile.originalname);
    return `${userExt}-${fileName.name}-${Date.now()}${fileName.ext}`
      .replace(/^\.+/g, '')
      .replace(/^\/+/g, '')
      .replace(/\r|\n/g, '_');
  }
  async uploadFile(dataBuffer: Buffer, key: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: key,
        // ACL: 'public-read',
      }),
    );
    // uploadResult.ETag
    return {
      key: key,
      url: '',
    };
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    userFolderName: string,
  ): Promise<{ key: string; url: string }> {
    const userFileName =
      `image/${userFolderName}/profileImage/` +
      this.setFilename(file, userFolderName);
    try {
      return await this.uploadFile(file.buffer, userFileName);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  async uploadAudio(file, userFolderName) {
    const userFileName = `audio/${userFolderName}/audioUrl/` +
        this.setFilename(file, userFolderName);
    try {
        return await this.uploadFile(file.buffer, userFileName);
    }
    catch (e) {
        this.logger.error(e);
        throw e;
    }
}
  async uploadGalleryFiles(
    files: Array<Express.Multer.File>,
    folderName: string,
  ) {
    try {
      const keYList = [];
      for (let i = 0; i < files.length; i++) {
        const userFileName =
          `images/${folderName}/gallery` +
          this.setFilename(files[i], folderName);
        const data = await this.uploadFile(files[i].buffer, userFileName);
        keYList.push(data.key);
      }

      return keYList;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
    // this.logger.log(files);
  }

  async getSingedFile(key: string): Promise<string> {
    try {
      if (key) {
        const command = new GetObjectCommand({
          Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
          Key: key,
        });
        return await getSignedUrl(this.s3Client, command, {
          expiresIn: 60 * 1440,
        });
      }
      return '';
    } catch (e) {
      this.logger.error(e);
      return '';
    }
  }

  async readBucketFile(path: string) {
    try {
      const streamToString = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () =>
            resolve(Buffer.concat(chunks).toString('utf8')),
          );
        });
      const command = new GetObjectCommand({
        Key: path,
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      });
      const response = await this.s3Client.send(command);

      const { Body } = response;
      return (await streamToString(Body)) as string;
    } catch (e) {
      this.logger.error(e);
      return '';
    }
  }
}
