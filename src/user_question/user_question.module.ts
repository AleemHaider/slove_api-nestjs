import { Module } from '@nestjs/common';
import { UserQuestionService } from './user_question.service';
import { UserQuestionController } from './user_question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { UserQuestionEntity } from '../entity/user-question.entity';
import { UserTypeEntity } from '../entity/user-type.entity';
import { UserPreferencesEntity } from '../entity/user-preferences.entity';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import { UserGalleryEntity } from '../entity/user-gallery.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { CountriesEntity } from '../entity/countries.entity';
import { CitiesEntity } from '../entity/cities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserQuestionEntity,
      UserTypeEntity,
      UserEntity,
      UserPreferencesEntity,
      ArtistTypeEntity,
      MusicGenreEntity,
      PreferredVenueEntity,
      UserGalleryEntity,
      CountriesEntity,
      CitiesEntity,
    ]),
  ],
  controllers: [UserQuestionController],
  providers: [UserQuestionService, FileUploadService, S3BucketService],
})
export class UserQuestionModule {}
