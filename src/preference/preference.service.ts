import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ArtistTypeEntity } from '../entity/artist-type.entity';
import { PreferenceListDto } from './dto/response/preference-list.dto';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import { PreferredVenueEntity } from '../entity/preferred-venue.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { FileUploadService } from '../file-upload/file-upload.service';
import { STATUS } from '../util/constant';

@Injectable()
export class PreferenceService {
  private logger: Logger = new Logger(PreferenceService.name);

  constructor(
    @InjectRepository(ArtistTypeEntity)
    private readonly artistTypeEntityRepository: Repository<ArtistTypeEntity>,
    @InjectRepository(MusicGenreEntity)
    private readonly musicGenreEntityRepository: Repository<MusicGenreEntity>,

    @InjectRepository(PreferredVenueEntity)
    private readonly preferredVenueEntityRepository: Repository<PreferredVenueEntity>,
    private readonly fileUploadService: FileUploadService,
  ) {}
  async getArtistList(search: string) {
    let list: ArtistTypeEntity[] = [];
    try {
      if (search === undefined || search === null || search === '') {
        list = await this.artistTypeEntityRepository.find({
          select: ['id', 'type', 'image'],
          where: {
            status: STATUS.ACTIVE,
          },
        });
        for (const item of list) {
          item.image = await this.fileUploadService.getSignedFile(item.image);
        }
        return new PreferenceListDto(list).getList();
      }
      list = await this.artistTypeEntityRepository.find({
        select: ['id', 'type', 'image'],
        where: {
          type: ILike(`%${search}%`),
          status: STATUS.ACTIVE,
        },
      });
      for (const item of list) {
        item.image = await this.fileUploadService.getSignedFile(item.image);
      }
      return new PreferenceListDto(list).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMusicGenreList(search: string) {
    let list: MusicGenreEntity[] = [];
    try {
      if (search === undefined || search === null || search === '') {
        list = await this.musicGenreEntityRepository.find({
          select: ['id', 'type', 'image'],
          where: {
            status: STATUS.ACTIVE,
          },
        });
        for (const item of list) {
          item.image = await this.fileUploadService.getSignedFile(item.image);
        }
        return new PreferenceListDto(list).getList();
      }

      list = await this.musicGenreEntityRepository.find({
        select: ['id', 'type', 'image'],
        where: {
          type: ILike(`%${search}%`),
          status: STATUS.ACTIVE,
        },
      });
      for (const item of list) {
        item.image = await this.fileUploadService.getSignedFile(item.image);
      }
      return new PreferenceListDto(list).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPreferredVenueList(search: string) {
    try {
      if (search === undefined || search === null || search === '') {
        const list = await this.preferredVenueEntityRepository.find({
          select: ['id', 'type', 'image'],
          where: {
            status: STATUS.ACTIVE,
          },
        });
        for (const item of list) {
          item.image = await this.fileUploadService.getSignedFile(item.image);
        }
        return new PreferenceListDto(list).getList();
      }
      const list = await this.preferredVenueEntityRepository.find({
        select: ['id', 'type', 'image'],
        where: {
          type: ILike(`%${search}%`),
          status: STATUS.ACTIVE,
        },
      });
      for (const item of list) {
        item.image = await this.fileUploadService.getSignedFile(item.image);
      }
      return new PreferenceListDto(list).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
