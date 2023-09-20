import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserTypeEntity } from '../entity/user-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { UserQuestionEntity } from '../entity/user-question.entity';
import { UserPreferencesEntity } from '../entity/user-preferences.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { UserGalleryEntity } from '../entity/user-gallery.entity';
import { UserQuestionService } from '../user_question/user_question.service';
import { CountriesEntity } from '../entity/countries.entity';
import { CitiesEntity } from '../entity/cities.entity';
import { ContactEntity } from '../entity/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeEntity,
      UserEntity,
      UserQuestionEntity,
      UserPreferencesEntity,
      MusicGenreEntity,
      PreferredVenueEntity,
      ArtistTypeEntity,
      UserGalleryEntity,
      CountriesEntity,
      CitiesEntity,
      ContactEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    FileUploadService,
    S3BucketService,
    UserQuestionService,
  ],
  exports: [UserService],
})
export class UserModule {}
