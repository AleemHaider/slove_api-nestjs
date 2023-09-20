import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddUserTypeDto } from './dto/request/add-user-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserTypeEntity } from '../entity/user-type.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { UserProfileDto } from './dto/response/user-profile.dto';
import { UserQuestionEntity } from '../entity/user-question.entity';
import { UserPreferencesEntity } from '../entity/user-preferences.entity';
import { USER_TYPE } from '../util/constant';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { isArray } from 'radash';
import { FileUploadService } from '../file-upload/file-upload.service';
import { UserDetailsDto } from './dto/response/user-details.dto';
import { UserGalleryEntity } from '../entity/user-gallery.entity';
import paginationUtil from '../common/helper/pagination-util';
import { getAllConsumerWhereList, getWhereDiscovery } from './util/find-all';
import { ContactEntity } from '../entity/contact.entity';
import setMusicGenre from '../common/helper/set-music-genre-util';
import * as dayjs from 'dayjs';
@Injectable()
export class UserService {
  private logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserTypeEntity)
    private readonly userTypeEntityRepository: Repository<UserTypeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserQuestionEntity)
    private readonly userQuestionEntityRepository: Repository<UserQuestionEntity>,
    @InjectRepository(UserPreferencesEntity)
    private readonly userPreferencesEntityRepository: Repository<UserPreferencesEntity>,
    @InjectRepository(MusicGenreEntity)
    private readonly musicGenreEntityRepository: Repository<MusicGenreEntity>,
    @InjectRepository(PreferredVenueEntity)
    private readonly preferredVenueEntityRepository: Repository<PreferredVenueEntity>,
    @InjectRepository(ArtistTypeEntity)
    private readonly artistTypeEntityRepository: Repository<ArtistTypeEntity>,
    private readonly fileUploadService: FileUploadService,
    private readonly dataSource: DataSource,
    @InjectRepository(UserGalleryEntity)
    private readonly galleryEntityRepository: Repository<UserGalleryEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactEntityRepository: Repository<ContactEntity>,
  ) {}

  async addUserType(currentUser: UserEntity, dto: AddUserTypeDto) {
    const type = await this.userTypeEntityRepository.findOne({
      where: {
        id: dto.id,
      },
    });
    if (type == null) {
      throw new NotFoundException(ERROR_MESSAGES.USER_TYPE_NOT_FOUND);
    }
    try {
      await this.userRepository.update(
        { id: currentUser.id },
        { userType: type },
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCurrentProfile(user: UserEntity): Promise<UserProfileDto> {
    const profile = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: ['userType'],
    });
    if (profile == null) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    try {
      return new UserProfileDto(
        profile.email,
        profile.emailVerified,
        profile.registerType,
        profile.firstname,
        profile.lastname,
        profile.onboardingComplete,
        profile.userType ? profile.userType.id : null,
        profile.chatId,
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRecommendations(user: UserEntity, page = '1', limit = '10') {
    // const queryLimit = paginationUtil(page, limit);

    const profile = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: ['userType'],
      select: ['userType', 'id'],
    });
    this.logger.log('user.id: ' + user.id);

    // const preferences = await this.dataSource.manager.query(
    //   `select artist_type,music_genre,preferred_venue from user_preferences where user_id=$1 limit 1`,
    //   [String(user.id)],
    // );
    //

    this.logger.log('getting preferences');
    const preferences = await this.userPreferencesEntityRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      select: ['id', 'artistType', 'musicGenre', 'preferredVenue'],
    });
    if (!profile.userType) {
      return {};
    }
    switch (profile.userType.id) {
      case USER_TYPE.ARTIST:
        return await this.getArtistRecommendations(
          profile,
          preferences,
          page,
          limit,
        );
      case USER_TYPE.VENUE:
        return await this.getVenueRecommendations(
          profile,
          preferences,
          page,
          limit,
        );
      case USER_TYPE.CONSUMER:
        return;
      default:
        return;
    }
  }
  private async getArtistRecommendations(
    currentUser: UserEntity,
    preferences: UserPreferencesEntity,
    page,
    limit,
  ) {
    const queryLimit = paginationUtil(page, limit);
    this.logger.log(queryLimit);
    let data = await this.dataSource.manager.query(
      `select (likelihood_gen( $1,up.music_genre)) as likelihood, u.email,u.user_type_id as userType,u.chat_id as chat_id,u.profile_image as profileImage,u.bio,up.music_genre,up.preferred_venue,
       up.artist_type, uq.* from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id 
    where music_genre && $1 and u.user_type_id=2 order by  likelihood desc   ${queryLimit} `,
      [preferences.musicGenre],
    );
    const count: [{ count: number }] = await this.dataSource.manager.query(
      `select count(*) from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id where  music_genre && $1 and u.user_type_id=2`,
      [preferences.musicGenre],
    );

    if (isArray(data) && data.length == 0) {
      data = await this.dataSource.manager.query(`
      select u.email,u.chat_id as chat_id,u.user_type_id as userType,u.profile_image as profileImage,u.bio,up.music_genre,up.preferred_venue,up.artist_type, uq.* from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id where u.user_type_id=2 ORDER BY random() ${queryLimit}`);
      if (isArray(count)) {
        count[0].count = Number(limit);
      }
      for (let i = 0; i < data.length; i++) {
        data[i].likelihood = 0;
      }
    }
    this.logger.log({ count });

    const [musicGenre, preferredVenue, artistType] =
      await this.getPreferencesListNew();

    const currentUserContactList = await this.dataSource.manager.query(
      `select contact_user_id as id from contact where user_id=${currentUser.id}`,
    );
    this.logger.log('currentUserContactList');
    this.logger.log({ currentUserContactList });
    data = await this.setDetails(
      data,
      preferences,
      musicGenre,
      preferredVenue,
      artistType,
      currentUserContactList,
    );
    // if (isArray(data) && data.length > 0) {
    //   data = data as any;
    //   for (let i = 0; i < data.length; i++) {
    //     if (
    //       currentUser.userType.id == USER_TYPE.ARTIST ||
    //       currentUser.userType.id == USER_TYPE.VENUE
    //     ) {
    //       let pCount = 0;
    //       for (let j = 0; j < data[i].music_genre.length; j++) {
    //         for (let k = 0; k < preferences.musicGenre.length; k++) {
    //           if (preferences.musicGenre[k] == data[i].music_genre[j]) {
    //             pCount++;
    //           }
    //         }
    //       }
    //       console.log(pCount);
    //       const percentage = (pCount / preferences.musicGenre.length) * 100;
    //       // console.log(percentage);
    //       data[i].likelyHood = Math.floor(percentage);
    //     } else {
    //       data[i].likelyHood = 0;
    //     }
    //   }
    // }

    return new UserDetailsDto().getRecommendedList(
      data,
      count[0].count,
      page,
      limit,
    );
  }

  async isUserInContactList(id, currentUserContactList) {
    for (let i = 0; i < currentUserContactList.length; i++) {
      if (currentUserContactList[i].id == id) {
        return true;
      }
    }
    return false;
  }
  async setPreferredVenueUsers(
    list: [],
    preferredVenue: PreferredVenueEntity[],
    userPreferredVenue,
  ) {
    const preferredVenueList = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < preferredVenue.length; j++) {
        if (list[i] == preferredVenue[j].id) {
          const obj = {
            id: preferredVenue[j].id,
            type: preferredVenue[j].type,
            isMatching: userPreferredVenue
              ? Array.from(userPreferredVenue)
                  .map((item) => item)
                  .includes(preferredVenue[j].id)
              : false,
          };
          preferredVenueList.push(obj);
        }
      }
    }
    return preferredVenueList;
  }

  async setMusicGenreUsers(
    list: [],
    musicGenre: MusicGenreEntity[],
    userMusicGenre,
  ) {
    const musicGenreList = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < musicGenre.length; j++) {
        if (list[i] == musicGenre[j].id) {
          const obj = {
            id: musicGenre[j].id,
            type: musicGenre[j].type,
            isMatching: userMusicGenre
              ? Array.from(userMusicGenre)
                  .map((item) => item)
                  .includes(musicGenre[j].id)
              : false,
          };
          musicGenreList.push(obj);
        }
      }
    }
    return musicGenreList;
  }

  async setArtistTypeUsers(
    list: [],
    artistEntity: ArtistTypeEntity[],
    userArtistType,
  ) {
    const artistTypeList = [];

    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < artistEntity.length; j++) {
        if (list[i] == artistEntity[j].id) {
          const obj = {
            id: artistEntity[j].id,
            type: artistEntity[j].type,
            isMatching: userArtistType
              ? Array.from(userArtistType)
                  .map((item) => item)
                  .includes(artistEntity[j].id)
              : false,
          };
          artistTypeList.push(obj);
        }
      }
    }
    return artistTypeList;
  }
  private async getVenueRecommendations(
    currentUser: UserEntity,
    preferences: UserPreferencesEntity,
    page,
    limit,
  ) {
    const queryLimit = paginationUtil(page, limit);

    let data = await this.dataSource.manager.query(
      `select (likelihood_gen( $1,up.music_genre)) as likelihood, u.email,u.chat_id as chat_id,u.user_type_id as userType,u.profile_image as profileImage,u.bio,up.music_genre,up.preferred_venue,
       up.artist_type, uq.* from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id where music_genre && $1 and u.user_type_id=1  order by  likelihood desc ${queryLimit}`,
      [preferences.musicGenre],
    );

    const count = await this.dataSource.manager.query(
      `select count(*) from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id where  music_genre && $1 and u.user_type_id=1`,
      [preferences.musicGenre],
    );

    if (data.length == 0) {
      data = await this.dataSource.manager
        .query(`select  u.email,u.chat_id as chat_id,u.user_type_id as userType,u.profile_image as profileImage,u.bio,up.music_genre,up.preferred_venue,
       up.artist_type, uq.* from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id where  u.user_type_id=1 ORDER BY random() ${queryLimit}`);

      count[0].count = Number(limit);
      for (let i = 0; i < data.length; i++) {
        data[i].likelihood = 0;
      }
    }
    const [musicGenre, preferredVenue, artistType] =
      await this.getPreferencesListNew();

    const currentUserContactList = await this.dataSource.manager.query(
      `select contact_user_id as id from contact where user_id=${currentUser.id}`,
    );
    data = await this.setDetails(
      data,
      preferences,
      musicGenre,
      preferredVenue,
      artistType,
      currentUserContactList,
    );
    // if (isArray(data) && data.length > 0) {
    //   data = data as any;
    //   for (let i = 0; i < data.length; i++) {
    //     let pCount = 0;
    //     for (let j = 0; j < data[i].music_genre.length; j++) {
    //       for (let k = 0; k < preferences.musicGenre.length; k++) {
    //         if (preferences.musicGenre[k] == data[i].music_genre[j]) {
    //           pCount++;
    //         }
    //       }
    //     }
    //     console.log(pCount);
    //     const percentage = (pCount / preferences.musicGenre.length) * 100;
    //     // console.log(percentage);
    //     data[i].likelyHood = Math.floor(percentage);
    //   }
    // }

    return new UserDetailsDto().getRecommendedList(
      data,
      count[0].count,
      page,
      limit,
    );
  }

  async getConsumerRecommendations(
    user: UserEntity,
    genre: string,
    search: string,
    page = '1',
    limit = '10',
  ) {
    const queryLimit = paginationUtil(page, limit);
    const preferences = await this.userPreferencesEntityRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      select: ['musicGenre', 'id'],
    });
    this.logger.log({ preferences });
    const whereQuery = getAllConsumerWhereList(search, genre, preferences);
    // user.id
    try {
      let data = await this.dataSource.manager
        .query(`select e.event_name,cast(e.start_time as TEXT) as start_time,cast(e.end_time as TEXT) as end_time,e.ticket_price,artist.profile_image as artist_profile_image,
    artist_uq.band_name as artist_name,artist_country.name as artist_country,artist_city.name as artist_city,artist.bio as artist_bio,
    venue_uq.venue_name as venue_name,venue.profile_image as venue_profile_image,venue_country.name as venue_country,venue_city.name as venue_city,bc.music_genre,
    artist.id as artist_id,venue.id as venue_id,cast(e.created_at as TEXT) as event_created_at,e.id as event_id
    from event e left join booking_contract bc on bc.id = e.booking_contract_id left join "user" artist on artist.id = e.artist_id
    left join "user" venue on venue.id=e.venue_id left join user_question artist_uq on artist.id = artist_uq.user_id left join user_question venue_uq
    on venue.id=venue_uq.user_id left join countries artist_country on artist_uq.country_id = artist_country.id left join countries venue_country
    on venue_uq.country_id=venue_country.id left join cities artist_city on artist_uq.city_id = artist_city.id left join cities venue_city on
    venue_uq.city_id=venue_city.id where e.status='ACTIVE' ${whereQuery}  order by e.start_time asc  ${queryLimit}`);

      const count: [{ count: number }] = await this.dataSource.manager
        .query(`select count(e.id) as count
    from event e left join booking_contract bc on bc.id = e.booking_contract_id left join "user" artist on artist.id = e.artist_id
    left join "user" venue on venue.id=e.venue_id left join user_question artist_uq on artist.id = artist_uq.user_id left join user_question venue_uq
    on venue.id=venue_uq.user_id left join countries artist_country on artist_uq.country_id = artist_country.id left join countries venue_country
    on venue_uq.country_id=venue_country.id left join cities artist_city on artist_uq.city_id = artist_city.id left join cities venue_city on
    venue_uq.city_id=venue_city.id where e.status='ACTIVE' ${whereQuery} `);

      if (isArray(data) && data.length == 0) {
        data = await this.dataSource.manager.query(`
        select e.event_name,cast(e.start_time as TEXT) as start_time,cast(e.end_time as TEXT) as end_time,e.ticket_price,artist.profile_image as artist_profile_image,
    artist_uq.band_name as artist_name,artist_country.name as artist_country,artist_city.name as artist_city,artist.bio as artist_bio,
    venue_uq.venue_name as venue_name,venue.profile_image as venue_profile_image,venue_country.name as venue_country,venue_city.name as venue_city,bc.music_genre,
    artist.id as artist_id,venue.id as venue_id,cast(e.created_at as TEXT) as event_created_at,e.id as event_id
    from event e left join booking_contract bc on bc.id = e.booking_contract_id left join "user" artist on artist.id = e.artist_id
    left join "user" venue on venue.id=e.venue_id left join user_question artist_uq on artist.id = artist_uq.user_id left join user_question venue_uq
    on venue.id=venue_uq.user_id left join countries artist_country on artist_uq.country_id = artist_country.id left join countries venue_country
    on venue_uq.country_id=venue_country.id left join cities artist_city on artist_uq.city_id = artist_city.id left join cities venue_city on
    venue_uq.city_id=venue_city.id where e.status='ACTIVE' and e.start_time >= '${dayjs(
      new Date(),
    ).format('YYYY-MM-DD')}' ORDER BY random()  ${queryLimit} `);
        count[0].count = Number(limit);
      }

      data = await this.setUserCommonDetails(data);
      // const musicGenre = await this.musicGenreEntityRepository.find({
      //   select: ['id', 'type'],
      // });
      // if (isArray(data)) {
      //   data = data as any;
      //
      //   for (let i = 0; i < data.length; i++) {
      //     const element = data[i];
      //     element.music_genre = await setMusicGenre(
      //       musicGenre,
      //       element.music_genre,
      //     );
      //     element.artist_profile_image =
      //       await this.fileUploadService.getSignedFile(
      //         element.artist_profile_image,
      //       );
      //     element.venue_profile_image =
      //       await this.fileUploadService.getSignedFile(
      //         element.venue_profile_image,
      //       );
      //   }
      // }
      return new UserDetailsDto().getConsumerList(
        data,
        isArray(count) ? count[0].count : 0,
        page,
        limit,
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setUserCommonDetails(data) {
    const musicGenre = await this.musicGenreEntityRepository.find({
      select: ['id', 'type'],
    });
    if (isArray(data)) {
      data = data as any;

      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        element.music_genre = await setMusicGenre(
          musicGenre,
          element.music_genre,
        );
        element.artist_profile_image =
          await this.fileUploadService.getSignedFile(
            element.artist_profile_image,
          );
        element.venue_profile_image =
          await this.fileUploadService.getSignedFile(
            element.venue_profile_image,
          );
      }
    }
    return data;
  }

  async getPreferencesListNew() {
    const musicGenre = await this.musicGenreEntityRepository.find({
      select: ['id', 'type'],
    });
    const preferredVenue = await this.preferredVenueEntityRepository.find({
      select: ['id', 'type'],
    });
    const artistType = await this.artistTypeEntityRepository.find({
      select: ['id', 'type'],
    });
    return [musicGenre, preferredVenue, artistType];
  }
  async getPreferencesList(
    musicGenreList: any,
    preferredVenueList: any,
    artistTypeList: any,
  ) {
    let artistType = [];
    let musicGenre = [];
    let preferredVenue = [];

    musicGenre = await this.musicGenreEntityRepository.find({
      where: {
        id: In(Array.from(musicGenreList).map((e) => Number(e))),
      },
      select: ['id', 'type'],
    });

    preferredVenue = await this.preferredVenueEntityRepository.find({
      where: {
        id: In(Array.from(preferredVenueList).map((e) => Number(e))),
      },
      select: ['id', 'type'],
    });

    // this.logger.log(
    //   'Array.from(artistTypeList).length',
    //   Array.from(artistTypeList).length,
    // );
    // this.logger.log(Array.from(artistTypeList));

    artistType = await this.artistTypeEntityRepository.find({
      where: {
        id: In(Array.from(artistTypeList).map((e) => Number(e))),
      },
      select: ['id', 'type'],
    });

    return [musicGenre, preferredVenue, artistType];
  }

  async getOne(id: number) {
    const userQuestion = await this.userQuestionEntityRepository.findOne({
      where: {
        user: {
          id: id,
        },
      },
      relations: ['user', 'countryId', 'cityId'],
    });
    if (userQuestion == null) {
      return null;
    }
    const userPreferences = await this.userPreferencesEntityRepository.findOne({
      where: {
        user: {
          id: id,
        },
      },
    });

    const [musicGenre, preferredVenue, artistType] =
      await this.getPreferencesList(
        userPreferences.musicGenre,
        userPreferences.preferredVenue,
        userPreferences.artistType,
      );

    if (userQuestion && userQuestion.user) {
      userQuestion.user.profileImage =
        await this.fileUploadService.getSignedFile(
          userQuestion.user.profileImage,
        );
    }

    return new UserDetailsDto().getUserDetailsById(
      userQuestion,
      userPreferences,
      musicGenre,
      preferredVenue,
      artistType,
      userQuestion.user.chatId,
      
    );
  }

  async getCurrentUserGallery(currentUser: UserEntity) {
    this.logger.log({ currentUser });
    return await this.getGalleryById(currentUser.id);
  }

  async getUserGalleryById(id: number) {
    this.logger.log({ id });
    return await this.getGalleryById(id);
  }

  async getGalleryById(id: number) {
    const gallery = await this.galleryEntityRepository.findOne({
      where: {
        user: {
          id: id,
        },
      },
    });

    if (gallery == null || gallery.images.length == 0) {
      return [];
    }

    try {
      const list = [];
      for (let i = 0; i < gallery.images.length; i++) {
        // console.log(gallery.images[i]);
        const obj = {
          key: gallery.images[i],
          url: await this.fileUploadService.getSignedFile(gallery.images[i]),
        };
        list.push(obj);
      }
      return list;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserDiscovery(
    currentUser: UserEntity,
    type: string,
    typeId: string,
    page = '1',
    limit = '10',
    search: string,
  ) {
    // this.logger.log({ type, typeId, page, limit });

    const queryLimit = paginationUtil(page, limit);
    // this.logger.log(queryLimit);
    const whereQuery = getWhereDiscovery(type, typeId, search);
    // this.logger.log(whereQuery);

    let data = await this.dataSource.manager.query(
      `select u.email,u.chat_id as chat_id,u.user_type_id as userType,u.profile_image as profileImage,u.bio,up.music_genre as music_genre,
up.preferred_venue as preferred_venue,up.artist_type as artist_type, uq.* from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id ${whereQuery}  ${queryLimit}`,
    );

    const count: [{ count: number }] = await this.dataSource.manager.query(
      `select count(u.id) as count from user_preferences up left join "user"
    u on u.id = up.user_id left join user_question uq on u.id = uq.user_id ${whereQuery}`,
    );
    const [musicGenre, preferredVenue, artistType] =
      await this.getPreferencesListNew();
    // this.logger.log({ preferredVenueList, musicGenreList, artistTypeList });
    const preferences = await this.userPreferencesEntityRepository.findOne({
      where: {
        user: {
          id: currentUser.id,
        },
      },
      select: ['id', 'artistType', 'musicGenre', 'preferredVenue'],
    });
    const currentUserContactList = await this.dataSource.manager.query(
      `select contact_user_id as id from contact where user_id=${currentUser.id}`,
    );

    data = await this.setDetails(
      data,
      preferences,
      musicGenre,
      preferredVenue,
      artistType,
      currentUserContactList,
    );
    // this.logger.log(currentUserContactList);
    return new UserDetailsDto().getgetDiscoveryListNew(
      data,
      isArray(count) ? count[0].count : 0,
      page,
      limit,
    );
  }

  async setDetails(
    data: any,
    preferences: UserPreferencesEntity,
    musicGenre: MusicGenreEntity[],
    preferredVenue: MusicGenreEntity[],
    artistType: MusicGenreEntity[],
    currentUserContactList,
  ) {
    if (isArray(data) && data.length > 0) {
      data = data as any;
      for (let i = 0; i < data.length; i++) {
        data[i].profileimage = await this.fileUploadService.getSignedFile(
          data[i].profileimage,
        );
        
        data[i].artistType = await this.setArtistTypeUsers(
          data[i].artist_type,
          artistType,
          preferences.artistType,
        );
        data[i].genreType = await this.setMusicGenreUsers(
          data[i].music_genre,
          musicGenre,
          preferences.musicGenre,
        );
        data[i].venueType = await this.setPreferredVenueUsers(
          data[i].preferred_venue,
          preferredVenue,
          preferences.preferredVenue,
        );
        data[i].isInContactList = await this.isUserInContactList(
          data[i].user_id,
          currentUserContactList,
        );
      }
    }
    return data;
  }
}
