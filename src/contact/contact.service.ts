import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/request/create-contact.dto';
import { UserEntity } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ContactEntity } from '../entity/contact.entity';
import ERROR_MESSAGES from '../util/error-messages';
import paginationUtil from '../common/helper/pagination-util';
import { FileUploadService } from '../file-upload/file-upload.service';
import { GetCurrentUserContactListDto } from './dto/response/get-current-user-contact-list.dto';
import { getCurrentUserWhere } from './util/where-util';
import { DeleteContactDto } from './dto/request/delete-contact.dto';

@Injectable()
export class ContactService {
  private logger: Logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ContactEntity)
    private readonly contactEntityRepository: Repository<ContactEntity>,
    private readonly dataSource: DataSource,
    private readonly fileUploadService: FileUploadService,
  ) {}
  async create(currentUser: UserEntity, dto: CreateContactDto) {
    const contactUser = await this.userRepository.findOne({
      where: {
        id: dto.userId,
      },
    });
    if (!contactUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isUserAlreadyContact = await this.contactEntityRepository.findOne({
      where: {
        user: {
          id: currentUser.id,
        },
        contactUser: {
          id: contactUser.id,
        },
      },
    });
    if (isUserAlreadyContact) {
      throw new NotFoundException(ERROR_MESSAGES.USER_ALREADY_CONTACT);
    }
    try {
      const contact = new ContactEntity();
      contact.user = currentUser;
      contact.contactUser = contactUser;
      await this.contactEntityRepository.save(contact);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new NotFoundException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // findAll() {
  //   return `This action returns all contact`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} contact`;
  // }
  //
  // update(id: number, updateContactDto: UpdateContactDto) {
  //   return `This action updates a #${id} contact`;
  // }

  async remove(currentUser: UserEntity, dto: DeleteContactDto) {
    try {
      if ((Array.isArray(dto.id) && dto.id.length > 0) || dto.id) {
        const contact = await this.contactEntityRepository.find({
          where: {
            id: Array.isArray(dto.id) ? In(dto.id) : dto.id,
            user: {
              id: currentUser.id,
            },
          },
        });
        await this.contactEntityRepository.remove(contact);
        return;
      }
      if ((Array.isArray(dto.userId) && dto.userId.length > 0) || dto.userId) {
        const contact = await this.contactEntityRepository.find({
          where: {
            user: {
              id: currentUser.id,
            },
            contactUser: {
              id: Array.isArray(dto.userId) ? In(dto.userId) : dto.userId,
            },
          },
        });
        await this.contactEntityRepository.remove(contact);
        return;
      }
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findCurrentUserAllContact(
    user: UserEntity,
    page: string,
    limit: string,
    userType: string,
    search: string,
    sort: string,
  ) {
    const queryLimit = paginationUtil(page, limit);
    const whereList = getCurrentUserWhere(search, userType);
    const data = await this.dataSource.manager
      .query(`select   DISTINCT ON (u.id ) u.id as user_id,u.email as email,uq.mobile_phone,u.profile_image,ut.type as user_type,ut.id as user_type_id,
       c.user_id as current_user_id,uq.band_name as band_name,uq.venue_name as venue_name,uq.consumer_name as consumer_name,u.chat_id as chat_id
      from contact c inner join "user" u on c.contact_user_id = u.id left join user_question uq on u.id = uq.user_id
       left join user_type ut on u.user_type_id = ut.id where c.user_id=${user.id}  ${whereList} ${queryLimit};`);

    // get total count
    const totalCount = await this.dataSource.manager
      .query(`select count(u.id) as count
      from contact c inner join "user" u on c.contact_user_id = u.id left join user_question uq on u.id = uq.user_id
       left join user_type ut on u.user_type_id = ut.id where c.user_id=${user.id} and u.status = 'ACTIVE' `);
    // if (totalCount[0]) {
    //   this.logger.log({ count: totalCount[0].count });
    // }
    try {
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          data[i].profile_image = await this.fileUploadService.getSignedFile(
            data[i].profile_image,
          );
        }
      }

      return new GetCurrentUserContactListDto(
        data,
        totalCount && totalCount[0] ? totalCount[0].count : 0,
        page,
        limit,
        sort,
      ).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
