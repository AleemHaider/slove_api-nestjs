import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddAnswersDto } from './dto/request/add-answers.dto';
import { UserEntity } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UserQuestionEntity } from '../entity/user-question.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { UserTypeEntity } from '../entity/user-type.entity';
import { UserPreferencesEntity } from '../entity/user-preferences.entity';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import { UpdateAnswersDto } from './dto/request/update-answers.dto';
import { UserGalleryEntity } from '../entity/user-gallery.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UserDetailsDto } from '../user/dto/response/user-details.dto';
import { USER_QUESTION_COUNT, USER_TYPE } from '../util/constant';
import { CountriesEntity } from '../entity/countries.entity';
import { CitiesEntity } from '../entity/cities.entity';

@Injectable()
export class UserQuestionService {
  private logger: Logger = new Logger(UserQuestionService.name);

  constructor(
    @InjectRepository(UserQuestionEntity)
    private readonly userQuestionEntityRepository: Repository<UserQuestionEntity>,

    @InjectRepository(UserTypeEntity)
    private readonly userTypeEntityRepository: Repository<UserTypeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserGalleryEntity)
    private readonly galleryEntityRepository: Repository<UserGalleryEntity>,
    @InjectRepository(UserPreferencesEntity)
    private readonly userPreferencesEntityRepository: Repository<UserPreferencesEntity>,
    @InjectRepository(ArtistTypeEntity)
    private readonly artistTypeEntityRepository: Repository<ArtistTypeEntity>,
    @InjectRepository(MusicGenreEntity)
    private readonly musicGenreEntityRepository: Repository<MusicGenreEntity>,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(PreferredVenueEntity)
    private readonly preferredVenueEntityRepository: Repository<PreferredVenueEntity>,
    @InjectRepository(CountriesEntity)
    private readonly countriesEntityRepository: Repository<CountriesEntity>,

    @InjectRepository(CitiesEntity)
    private readonly citiesEntityRepository: Repository<CitiesEntity>,
    private readonly dataSource: DataSource,
  ) {}
  async addAnswer(currentUser: UserEntity, dto: AddAnswersDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
      relations: ['userType'],
      select: ['id', 'userType', 'onboardingComplete', 'profileImage'],
    });
    this.logger.log({ user });
    this.logger.log({ dto });

    if (user == null || user.userType == null) {
      throw new NotFoundException(ERROR_MESSAGES.USER_TYPE_NOT_DEFINED);
    }

    try {
      let userQuestionEntity = await this.userQuestionEntityRepository.findOne({
        where: {
          user: {
            id: currentUser.id,
          },
        },
        relations: ['user'],
      });

      if (userQuestionEntity == null) {
        userQuestionEntity = new UserQuestionEntity();
        userQuestionEntity.user = currentUser;
      }

      let userPreferencesEntity =
        await this.userPreferencesEntityRepository.findOne({
          where: {
            user: {
              id: currentUser.id,
            },
          },
          relations: ['user'],
        });
      if (userPreferencesEntity == null) {
        userPreferencesEntity = new UserPreferencesEntity();
        userPreferencesEntity.user = currentUser;
      }

      userQuestionEntity = await this.addUserAnswers(userQuestionEntity, dto);
      userQuestionEntity.step = dto.step;
      userPreferencesEntity = await this.addUserPreferences(
        userPreferencesEntity,
        dto,
      );
      await this.addUserGallery(currentUser, dto);

      if (user.onboardingComplete == false) {
        user.onboardingComplete = true;
      }
      user.profileImage = dto.profileImage;
      user.firstname = dto.firstname;
      user.lastname = dto.lastname;
      this.logger.log('chatId', dto.chatId);

      if (dto.chatId) {
        user.chatId = dto.chatId;
      }
      await this.userRepository.save(user);
      await this.userPreferencesEntityRepository.save(userPreferencesEntity);

      await this.userQuestionEntityRepository.save(userQuestionEntity);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async addUserAnswers(
    entity: UserQuestionEntity,
    dto: AddAnswersDto | UpdateAnswersDto,
  ) {
    entity.bandName = dto.bandName;
    entity.city = dto.city;
    if(dto.audioUrl!=null) {entity.audioUrl = await this.fileUploadService.getSignedFile(
      dto.audioUrl,
    );}
    entity.country = dto.country;
    entity.mobilePhone = dto.mobilePhone;
    entity.activeTime = dto.activeTime;
    entity.gigs = dto.gigs;
    entity.bookingPrice = dto.bookingPrice;
    entity.websiteLink = dto.websiteLink;
    entity.socialMediaLink = dto.socialMediaLink;
    this.logger.log('dto.spotify', dto.spotify);
    entity.spotify = dto.spotify;
    entity.facebook = dto.facebook;
    entity.instagram = dto.instagram;
    entity.youtube = dto.youtube;
    entity.additionalLinks = dto.additionalLinks;
    entity.organizationName = dto.organizationName;
    entity.venueName = dto.venueName;
    entity.streetName = dto.streetName;
    entity.venueCapacity = dto.venueCapacity;
    entity.livePerformancePerMonth = dto.livePerformancePerMonth;
    entity.peakSeason = dto.peakSeason;
    entity.musicianExposure = dto.musicianExposure;
    entity.socialMediaFollowers = dto.socialMediaFollowers;
    entity.averagePayPerGig = dto.averagePayPerGig;
    entity.followerCount = dto.followerCount;
    entity.rating = dto.rating;
    entity.phoneCode = dto.phoneCode;
    entity.countryCode = dto.countryCode;
    if(dto.audioUrl!=null) {entity.audioUrl = await this.fileUploadService.getSignedFile(
      dto.audioUrl,
    );}
    if (dto.openHours) {
      entity.openingStartAt = dto.openHours.split('-')[0];
      entity.openingEndAt = dto.openHours.split('-')[1];
    }
    if (dto.countryId) {
      entity.countryId = await this.countriesEntityRepository.findOne({
        where: { id: dto.countryId },
      });
    }
    if (dto.cityId) {
      entity.cityId = await this.citiesEntityRepository.findOne({
        where: { id: dto.cityId },
      });
    }
    entity.consumerName = dto.consumerName;
    return entity;
  }
  private async addUserPreferences(
    entity: UserPreferencesEntity,
    dto: AddAnswersDto | UpdateAnswersDto,
  ) {
    entity.artistType = dto.artistType;
    entity.musicGenre = dto.genreType;
    entity.preferredVenue = dto.venueType;
    return entity;
  }
  private async addUserGallery(
    currentUser: UserEntity,
    dto: AddAnswersDto | UpdateAnswersDto,
  ) {
    try {
      let galleryEntity = await this.galleryEntityRepository.findOne({
        where: {
          user: {
            id: currentUser.id,
          },
        },
      });
      // this.logger.log({ galleryEntity });
      if (galleryEntity == null) {
        galleryEntity = new UserGalleryEntity();
        galleryEntity.user = currentUser;
      }
      if (dto.galleryImages && dto.galleryImages.length >= 0) {
        galleryEntity.images = dto.galleryImages;
      }

      await this.galleryEntityRepository.save(galleryEntity);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getCurrentUserAnswers(currentUser: UserEntity) {
    try {
      const userQuestionEntity =
        await this.userQuestionEntityRepository.findOne({
          where: {
            user: {
              id: currentUser.id,
            },
          },
          relations: ['countryId', 'cityId'],
        });

      if (userQuestionEntity == null) {
        return null;
      }

      const userPreferencesEntity =
        await this.userPreferencesEntityRepository.findOne({
          where: {
            user: {
              id: currentUser.id,
            },
          },
          relations: ['user'],
        });

      const artistList = await this.artistTypeEntityRepository.find({
        where: {
          id: In(userPreferencesEntity.artistType),
        },
        select: ['id', 'type'],
      });

      const genreList = await this.musicGenreEntityRepository.find({
        where: {
          id: In(userPreferencesEntity.musicGenre),
        },
        select: ['id', 'type'],
      });

      const venueList = await this.preferredVenueEntityRepository.find({
        where: {
          id: In(userPreferencesEntity.preferredVenue),
        },
        select: ['id', 'type'],
      });
      const user = await this.userRepository.findOne({
        where: {
          id: currentUser.id,
        },
        relations: ['userType'],
        select: [
          'id',
          'userType',
          'onboardingComplete',
          'profileImage',
          'bio',
          'email',
          'emailVerified',
        ],
      });
      // this.logger.log({ artistList });
      user.profileImage = await this.fileUploadService.getSignedFile(
        user.profileImage,
      );

      const completePercentage = await this.getProfileCompleteStatus(
        currentUser.id,
      );

      return new UserDetailsDto().getCurrentUserAnswers(
        userQuestionEntity,
        userPreferencesEntity,
        artistList,
        genreList,
        venueList,
        currentUser.chatId,
        user,
        completePercentage,
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCurrentUserAnswers(
    currentUser: UserEntity,
    dto: UpdateAnswersDto,
  ) {
    this.logger.log({ dto });
    const user = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });
    let userQuestionEntity = await this.userQuestionEntityRepository.findOne({
      where: {
        user: {
          id: currentUser.id,
        },
      },
      relations: ['user'],
    });
    let userPreferencesEntity =
      await this.userPreferencesEntityRepository.findOne({
        where: {
          user: {
            id: currentUser.id,
          },
        },
        relations: ['user'],
      });
    try {
      userQuestionEntity = await this.addUserAnswers(userQuestionEntity, dto);
      userPreferencesEntity = await this.addUserPreferences(
        userPreferencesEntity,
        dto,
      );
      await this.addUserGallery(currentUser, dto);

      user.profileImage = dto.profileImage;
      user.bio = dto.bio;
      this.logger.log('dto.chatId', dto.chatId);

      if (dto.chatId) {
        user.chatId = dto.chatId;
      }
      await this.userRepository.save(user);
      await this.userPreferencesEntityRepository.save(userPreferencesEntity);
      await this.userQuestionEntityRepository.save(userQuestionEntity);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfileCompleteStatus(id: number): Promise<number> {
    this.logger.log('ProfileCompleteStatus');
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: ['userType'],
    });
    // this.logger.log('user.userType', user.userType.type);
    if (user && user.userType) {
      if (user.userType.id == USER_TYPE.ARTIST) {
        const data = await this.dataSource.manager.query(
          `select u.id ,num_nulls(uq.band_name,u.bio,u,email,uq.mobile_phone,uq.active_time,uq.gigs,uq.booking_price,uq.country_id,uq.city_id,
array_length(up.artist_type, 1),array_length(up.preferred_venue, 1),array_length(up.music_genre, 1)) as count from user_question uq
left join "user" u on uq.user_id = u.id left join user_preferences up on u.id = up.user_id where u.id=$1`,
          [String(id)],
        );

        this.logger.log('data');
        this.logger.log(data);
        this.logger.log('data');
        if (data && data[0]) {
          const percentage =
            ((USER_QUESTION_COUNT.ARTIST - data[0].count) /
              USER_QUESTION_COUNT.ARTIST) *
            100;

          this.logger.log(data[0].count);
          this.logger.log('percentage');
          this.logger.log(percentage);
          this.logger.log('percentage');
          return percentage;
        }
      }
      if (user.userType.id == USER_TYPE.VENUE) {
        const data = await this.dataSource.manager.query(
          `select u.id ,num_nulls(uq.venue_name,u.bio,u.email,uq.mobile_phone,array_length(up.preferred_venue, 1),uq.venue_capacity,uq.live_performance_per_month,
    uq.peak_season,array_length(up.music_genre, 1),uq.musician_exposure,uq.average_pay_per_gig,uq.city_id,uq.country_id)
    as count from user_question uq left join "user" u on uq.user_id = u.id left join user_preferences up on u.id = up.user_id where u.id=$1`,
          [String(id)],
        );
        // this.logger.log({ data });

        /*
        feature me or someone else,
        if you see this code, don't worry about it, it's just a fancy way of writing
        Math.floor() . It's called double bitwise not operator.
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT
         */
        if (data && data[0]) {
          const percentage = ~~(
            ((USER_QUESTION_COUNT.VENUE - data[0].count) /
              USER_QUESTION_COUNT.VENUE) *
            100
          );
          this.logger.log('venue data count');
          // console.log(`Percentage: %${percentage}`)
          // const percentage =
          //   ((USER_QUESTION_COUNT.VENUE - data[0].count) /
          //     USER_QUESTION_COUNT.VENUE) *
          //   100;
          this.logger.log(data[0].count);
          this.logger.log(Math.floor(percentage));
          return percentage;
        }
      }
      if (user.userType.id == USER_TYPE.CONSUMER) {
        const data = await this.dataSource.manager.query(
          `select u.id ,num_nulls(uq.consumer_name,u.bio,uq.mobile_phone,u.email,array_length(up.preferred_venue, 1),
    array_length(up.music_genre, 1),uq.city_id,uq.country_id) as count from user_question uq left join "user" u on uq.user_id = u.id left join user_preferences up on u.id = up.user_id where u.id=$1`,
          [String(id)],
        );
        if (data && data[0]) {
          const percentage =
            ((USER_QUESTION_COUNT.CONSUMER - data[0].count) /
              USER_QUESTION_COUNT.CONSUMER) *
            100;
          this.logger.log(data[0].count);
          this.logger.log(Math.floor(percentage));
          return percentage;
        }
      }
    }

    return 0;
  }
}
