import { Module } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { PreferenceController } from './preference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArtistTypeEntity,
      MusicGenreEntity,
      PreferredVenueEntity,
    ]),
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService, FileUploadService, S3BucketService],
})
export class PreferenceModule {}
