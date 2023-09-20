import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/request/create-booking.dto';
import { UserEntity } from '../entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookingEntity } from '../entity/booking.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { isArray } from 'radash';
import * as dayjs from 'dayjs';
import { FileUploadService } from '../file-upload/file-upload.service';
import { BookingListDto } from './dto/response/booking-list.dto';
import { SubmitBookingRequestDto } from './dto/request/submit-booking-request.dto';
import { CreateContractDto } from './dto/request/create-contract.dto';
import { BookingContractEntity } from '../entity/booking-contract.entity';
import { MusicGenreEntity } from '../entity/music-genre.entity';
import paginationUtil from '../common/helper/pagination-util';
import { SubmitBookingContractRequestDto } from './dto/request/submit-booking-contract-request.dto';
import { EventEntity } from '../entity/event.entity';
import {
  BOOKING_CONTRACT_STATUS,
  CALENDAR_TYPE,
  USER_TYPE,
} from '../util/constant';
import setMusicGenre from '../common/helper/set-music-genre-util';
import { CalendarEntity } from '../entity/calendar.entity';
import { bookingOrderWhere } from './util/where-query-list';
import { BookingOrderListDto } from './dto/response/booking-order-list.dto';
import { UserService } from '../user/user.service';
import { TicketEntity } from '../entity/ticket.entity';

@Injectable()
export class BookingService {
  private logger: Logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingEntityRepository: Repository<BookingEntity>,
    @InjectRepository(UserEntity)
    private readonly userEntityRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(BookingContractEntity)
    private readonly bookingContractEntityRepository: Repository<BookingContractEntity>,
    @InjectRepository(MusicGenreEntity)
    private readonly musicGenreEntityRepository: Repository<MusicGenreEntity>,
    @InjectRepository(CalendarEntity)
    private readonly calendarEntityRepository: Repository<CalendarEntity>,
    @InjectRepository(EventEntity)
    private readonly eventEntityRepository: Repository<EventEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketEntityRepository: Repository<TicketEntity>,
    private readonly userService: UserService,
  ) {}
  async create(user: UserEntity, dto: CreateBookingDto) {
    this.logger.log({ dto });
    const booking = new BookingEntity();

    const artist = await this.userEntityRepository.findOne({
      where: {
        id: dto.userId,
      },
    });

    if (!artist) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const checkStartDate = dayjs(
      new Date(dto.date + ' ' + dto.startTime),
    ).format('YYYY-MM-DD HH:mm:ss');

    const checkEndDate = dayjs(new Date(dto.date + ' ' + dto.endTime)).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    this.logger.log('checkStartDate', checkStartDate);
    this.logger.log('checkEndDate', checkEndDate);
    const isTimeExistBooking = await this.dataSource.manager.query(`SELECT *
        FROM booking
        WHERE ('${checkStartDate}' BETWEEN start_time AND end_time or '${checkEndDate}' BETWEEN start_time AND end_time) and user_id=${artist.id} 
         and booking_status in ('ACCEPTED','PENDING')`);

    if (isArray(isTimeExistBooking) && isTimeExistBooking.length > 0) {
      this.logger.log('time exist on booking');
      throw new ConflictException(ERROR_MESSAGES.ALREADY_BOOKED);
    }
    const isTimeExistBookingContract = await this.dataSource.manager
      .query(`SELECT *
        FROM booking_contract bc right join booking b on bc.booking_id = b.id
        WHERE ('${checkStartDate}' BETWEEN bc.start_time AND bc.end_time or '${checkEndDate}' BETWEEN bc.start_time AND bc.end_time) and b.user_id=${artist.id}
         and bc.contract_status in ('ACCEPTED','PENDING')
        `);

    if (
      isArray(isTimeExistBookingContract) &&
      isTimeExistBookingContract.length > 0
    ) {
      this.logger.log('time exist on contract');
      throw new ConflictException(ERROR_MESSAGES.ALREADY_BOOKED);
    }

    booking.user = artist;
    booking.requestedUser = user;
    booking.startTime = new Date(dto.date + ' ' + dto.startTime);
    booking.endTime = new Date(dto.date + ' ' + dto.endTime);
    booking.message = dto.message;
    booking.musicGenre = dto.genreType;
    booking.minimumPrice = dto.minimumPrice;
    booking.maximumPrice = dto.maximumPrice;

    try {
      await this.bookingEntityRepository.save(booking);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(user: UserEntity, type: string, page: string, limit: string) {
    let data: string | any[];
    let count: [{ count: number }] = [{ count: 0 }];
    if (type == '') {
      return [];
    }
    const pagination = paginationUtil(page, limit);
    if (type == 'sent') {
      data = await this.dataSource.manager.query(`
    select bc.id as booking_contract_id,bc.music_genre as booking_contract_music_genre,bc.start_time as booking_contract_start_time,bc.end_time
    as booking_contract_end_time,bc.booking_price as booking_contract_booking_price,bc.equipment as booking_contract_equipment,bc.contract_status
    as contract_status,bc.event_name as booking_contract_event_name,bc.organisation_number as booking_contract_organisation_number,bc.ticket_price
    as booking_contract_ticket_price,cast(b.start_time as TEXT) as start_time,cast(b.end_time as TEXT) as end_time,b.requested_user_id as
    requested_user_id,b.id,b.music_genre,b.maximum_price,b.minimum_price,b.message,b.booking_status,b.user_id,
    uq.venue_name,uq.band_name,u.user_type_id as user_type,ru.user_type_id as request_user_type,u.chat_id,u.profile_image,c.name as country_name,c2.name
    as city_name from booking b  inner join "user" u on u.id = b.user_id inner join user_question uq on u.id = uq.user_id left join booking_contract bc on b.id = bc.booking_id
    left join countries c on uq.country_id = c.id left join cities c2 on uq.city_id = c2.id left join "user" ru on b.requested_user_id=ru.id
    where b.requested_user_id=${user.id} and  (b.booking_status='DECLINED' or b.booking_status='PENDING'
    or (b.booking_status='ACCEPTED' and bc.contract_status='DECLINED')) order by b.created_at desc ${pagination} `);

      count = await this.dataSource.manager.query(
        `select count(b.id) as count  from booking b  inner join "user"
          u on u.id = b.user_id inner join user_question uq on u.id = uq.user_id left join booking_contract bc on b.id = bc.booking_id
          left join countries c on uq.country_id = c.id left join cities c2 on uq.city_id = c2.id left join "user" ru on b.requested_user_id=ru.id
          where b.requested_user_id=${user.id} and  (b.booking_status='DECLINED' or b.booking_status='PENDING'
          or (b.booking_status='ACCEPTED' and bc.contract_status='DECLINED'))`,
      );
    }

    if (type == 'approved') {
      data = await this.dataSource.manager.query(`
   select e.id as event_id ,f.id as feedback_id, bc.id as booking_contract_id,bc.music_genre as booking_contract_music_genre,bc.start_time as booking_contract_start_time,
    bc.end_time as booking_contract_end_time,bc.booking_price as booking_contract_booking_price,bc.equipment as booking_contract_equipment,
    bc.contract_status as contract_status, bc.event_name as booking_contract_event_name,bc.organisation_number as booking_contract_organisation_number,
    bc.ticket_price as booking_contract_ticket_price, cast(b.start_time as TEXT) as start_time,cast(b.end_time as TEXT) as end_time,
    b.requested_user_id as requested_user_id,ru.user_type_id as request_user_type,b.id,b.music_genre,b.maximum_price,b.minimum_price,b.message,b.booking_status,b.user_id,
    u.user_type_id as user_type, uq.venue_name,uq.band_name,u.chat_id,u.profile_image,c.name as country_name,c2.name as city_name,ru.chat_id as requested_chat_id,
    ru.profile_image as requested_profile_image,ruq.venue_name as requested_venue_name,ruq.band_name as requested_band_name,ruc.name as
    requested_country_name,ruc2.name as requested_city_name from booking b left join booking_contract bc on b.id = bc.booking_id inner join
    "user" u on u.id = b.user_id inner join user_question uq on u.id = uq.user_id  left join countries c on uq.country_id = c.id left join cities
    c2 on uq.city_id = c2.id left join "user" ru on b.requested_user_id=ru.id inner join user_question ruq on ru.id=ruq.user_id left join countries
    ruc on ruq.country_id=ruc.id left join cities ruc2 on ruq.city_id=ruc2.id left join event e on bc.id = e.booking_contract_id left join feedback f on e.id = f.event_id where ((u.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status is null)
    or (u.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='ACCEPTED') or (u.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='PENDING'))
    or ((ru.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status is null) or (ru.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='ACCEPTED')
    or (ru.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='PENDING')) order by b.updated_at desc  ${pagination}
`);
      count = await this.dataSource.manager.query(
        `select count(b.id) as count from booking b left join booking_contract bc
    on b.id = bc.booking_id inner join "user" u on u.id = b.user_id inner join user_question uq on u.id = uq.user_id  left join countries c
    on uq.country_id = c.id left join cities c2 on uq.city_id = c2.id left join "user" ru on b.requested_user_id=ru.id where
    ((u.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status is null) or (u.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='ACCEPTED'))
   or ((ru.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status is null) or (ru.id=${user.id} and b.booking_status='ACCEPTED' and bc.contract_status='ACCEPTED'))`,
      );
    }
    if (type == 'received') {
      data = await this.dataSource.manager.query(`
        select bc.id as booking_contract_id,bc.music_genre as booking_contract_music_genre,bc.start_time as booking_contract_start_time,
    bc.end_time as booking_contract_end_time,bc.booking_price as booking_contract_booking_price,bc.equipment as booking_contract_equipment,
    bc.contract_status as contract_status,bc.event_name as booking_contract_event_name,bc.organisation_number as booking_contract_organisation_number,
    bc.ticket_price as booking_contract_ticket_price,cast(b.start_time as TEXT) as start_time,cast(b.end_time as TEXT) as end_time,
    b.requested_user_id as requested_user_id,ru.user_type_id as request_user_type,b.id,b.music_genre,
    b.maximum_price,b.minimum_price,b.message,b.booking_status,b.user_id,uq.venue_name,uq.band_name,u.chat_id,u.profile_image,u.user_type_id as user_type,
    c.name as country_name,c2.name as city_name from booking b inner join "user" u on u.id = b.requested_user_id inner join user_question uq on u.id = uq.user_id
    left join booking_contract bc on b.id = bc.booking_id left join countries c on uq.country_id = c.id left join cities c2 on uq.city_id = c2.id left join "user"
    ru on b.requested_user_id=ru.id where b.user_id=${user.id} and (b.booking_status='DECLINED' or b.booking_status='PENDING'
    or (b.booking_status='ACCEPTED' and bc.contract_status='DECLINED')) order by b.created_at desc ${pagination}`);

      count = await this.dataSource.manager
        .query(`select count(b.id) as count from booking b inner join "user" u on u.id = b.requested_user_id inner join user_question uq on u.id = uq.user_id
    left join booking_contract bc on b.id = bc.booking_id left join countries c on uq.country_id = c.id left join cities c2 on uq.city_id = c2.id left join "user"
    ru on b.requested_user_id=ru.id where b.user_id=${user.id} and (b.booking_status='DECLINED' or b.booking_status='PENDING'
    or (b.booking_status='ACCEPTED' and bc.contract_status='DECLINED')) `);
    }

    const musicGenre = await this.musicGenreEntityRepository.find({
      select: ['id', 'type'],
    });

    if (isArray(data)) {
      data = data as any;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        // console.log(element.music_genre.toString().split(','));
        element.music_genre = await setMusicGenre(
          musicGenre,
          element.music_genre,
        );
        if (element.booking_contract_id) {
          element.booking_contract_music_genre = await setMusicGenre(
            musicGenre,
            element.booking_contract_music_genre,
          );
        }
        element.profile_image = await this.fileUploadService.getSignedFile(
          element.profile_image,
        );
        if (element.requested_profile_image) {
          element.requested_profile_image =
            await this.fileUploadService.getSignedFile(
              element.requested_profile_image,
            );
        }
      }
    }
    this.logger.log('count', count);

    return new BookingListDto().getSentList(
      data,
      count && count[0] ? count[0].count : 0,
      Number(page),
      Number(limit),
      user,
      type,
    );
  }

  async status(user: UserEntity, dto: SubmitBookingRequestDto) {
    const bookingEntity = await this.bookingEntityRepository.findOne({
      where: {
        id: dto.id,
        user: {
          id: user.id,
        },
      },
    });
    if (!bookingEntity) {
      throw new NotFoundException(ERROR_MESSAGES.BOOKING_NOT_FOUND);
    }
    try {
      await this.bookingEntityRepository.update(
        { id: bookingEntity.id },
        { bookingStatus: dto.status },
      );
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createContract(user: UserEntity, dto: CreateContractDto) {
    this.logger.log({ dto });
    const booking = await this.bookingEntityRepository.findOne({
      where: {
        id: dto.id,
      },
      relations: ['user', 'requestedUser'],
    });
    if (!booking) {
      throw new NotFoundException(ERROR_MESSAGES.BOOKING_NOT_FOUND);
    }

    if (
      dayjs(booking.startTime).diff(new Date(dto.date + ' ' + dto.startTime)) <
      0
    ) {
      console.log('time diff');
      console.log(
        dayjs(booking.startTime).diff(new Date(dto.date + ' ' + dto.startTime)),
      );
      throw new BadRequestException(ERROR_MESSAGES.BOOKED_TIME_PASSED);
    }
    this.logger.log('booking.requestedUser.id', booking.requestedUser.id);
    this.logger.log('booking.user.id', booking.user.id);
    if (booking.requestedUser.id != user.id) {
      if (booking.user.id != user.id) {
        this.logger.log('not a booking user');
        throw new NotFoundException(ERROR_MESSAGES.BOOKING_NOT_FOUND);
      }
    }
    const isExistBookingContract =
      await this.bookingContractEntityRepository.findOne({
        where: {
          booking: {
            id: booking.id,
          },
        },
      });

    if (isExistBookingContract) {
      throw new BadRequestException(ERROR_MESSAGES.ALREADY_BOOKING_CONTRACT);
    }

    const bookingContractEntity = new BookingContractEntity();
    bookingContractEntity.bookingPrice = dto.bookingPrice;
    bookingContractEntity.equipment = dto.equipment;
    bookingContractEntity.eventName = dto.eventName;
    bookingContractEntity.booking = booking;
    bookingContractEntity.ticketPrice = dto.ticketPrice;
    bookingContractEntity.organisationNumber = dto.organisationNumber;
    bookingContractEntity.startTime = new Date(dto.date + ' ' + dto.startTime);
    bookingContractEntity.endTime = new Date(dto.date + ' ' + dto.endTime);
    bookingContractEntity.musicGenre = dto.genreType;

    try {
      await this.bookingContractEntityRepository.save(bookingContractEntity);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async contractStatus(user: UserEntity, dto: SubmitBookingContractRequestDto) {
    //todo - add user check
    //todo - use transaction
    const contract = await this.bookingContractEntityRepository.findOne({
      where: {
        id: dto.id,
      },
      relations: ['booking'],
    });
    if (!contract) {
      throw new NotFoundException(ERROR_MESSAGES.BOOKING_CONTRACT_NOT_FOUND);
    }
    if (contract.contractStatus == BOOKING_CONTRACT_STATUS.ACCEPTED) {
      throw new BadRequestException(ERROR_MESSAGES.ALREADY_CONTRACT_ACCEPTED);
    }
    const booking = await this.bookingEntityRepository.findOne({
      where: {
        id: contract.booking.id,
      },
      relations: ['user.userType', 'requestedUser.userType'],
    });
    // this.logger.log({ contract });
    // this.logger.log({ booking });
    if (dto.status == BOOKING_CONTRACT_STATUS.ACCEPTED) {
      if (dayjs(contract.startTime).diff(new Date()) < 0) {
        console.log('time diff');
        console.log(dayjs(contract.startTime).diff(new Date()));
        throw new BadRequestException(
          ERROR_MESSAGES.BOOKED_CONTRACT_TIME_PASSED,
        );
      }
    }
    this.logger.log('Transaction started');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (dto.status == BOOKING_CONTRACT_STATUS.ACCEPTED) {
        // console.log(dayjs(contract.startTime).diff(new Date()));

        const eventEntity = new EventEntity();
        eventEntity.bookingContract = contract;
        eventEntity.endTime = contract.endTime;
        eventEntity.startTime = contract.startTime;
        eventEntity.eventName = contract.eventName;
        eventEntity.ticketPrice = contract.ticketPrice;
        eventEntity.venue =
          booking.user.userType.id == USER_TYPE.VENUE
            ? booking.user
            : booking.requestedUser;
        eventEntity.artist =
          booking.user.userType.id == USER_TYPE.ARTIST
            ? booking.user
            : booking.requestedUser;
        await queryRunner.manager.getRepository(EventEntity).save(eventEntity);
        // await this.eventEntityRepository.save(eventEntity);
      }

      await queryRunner.manager
        .getRepository(BookingContractEntity)
        .update({ id: contract.id }, { contractStatus: dto.status });
      // await this.bookingContractEntityRepository.update(
      //   { id: contract.id },
      //   { contractStatus: dto.status },
      // );
      const calenderVenue = new CalendarEntity();
      calenderVenue.startTime = contract.startTime;
      calenderVenue.endTime = contract.endTime;
      calenderVenue.title = contract.eventName;
      calenderVenue.booking_contract = contract;
      calenderVenue.user = booking.user;
      calenderVenue.type = CALENDAR_TYPE.EVENT;
      await queryRunner.manager
        .getRepository(CalendarEntity)
        .save(calenderVenue);
      // await this.calendarEntityRepository.save(calenderVenue);
      const calenderArtist = new CalendarEntity();
      calenderArtist.startTime = contract.startTime;
      calenderArtist.endTime = contract.endTime;
      calenderArtist.title = contract.eventName;
      calenderArtist.booking_contract = contract;
      calenderArtist.type = CALENDAR_TYPE.EVENT;
      calenderArtist.user = booking.requestedUser;
      await queryRunner.manager
        .getRepository(CalendarEntity)
        .save(calenderArtist);
      // await this.calendarEntityRepository.save(calenderArtist);
      await queryRunner.commitTransaction();

      return;
    } catch (e) {
      this.logger.error(e);
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async bookingOrder(user: UserEntity, type: string, page = '1', limit = '10') {
    const pagination = paginationUtil(page, limit);
    const whereQuery = bookingOrderWhere(type);

    let data = await this.dataSource.manager.query(`SELECT
    subquery.*
FROM
    (
        SELECT
            e.id as event_id,
            e.event_name,
            cast(e.start_time as TEXT) as start_time,
            cast(e.end_time as TEXT) as end_time,
            e.ticket_price,
            f.id as feedback_id,
             artist.profile_image as artist_profile_image, artist_uq.band_name as artist_name,artist_country.name as artist_country,artist_city.name as artist_city,
artist.bio as artist_bio,venue_uq.venue_name as venue_name,venue.profile_image as venue_profile_image,venue_country.name as venue_country,venue_city.name
as venue_city,bc.music_genre,artist.id as artist_id,venue.id as venue_id,e.created_at as event_created_at,
            json_agg(
                json_build_object(
                    'id', o.id,
                    'quantity', o.quantity,
                    'quantity', o.quantity,
                    'order_status', o.order_status,
                    'invoice_number',o.invoice_number,
                    'total_price',o.total_price,
                    'tickets', (
                        SELECT
                            json_agg(json_build_object(
                                'id', t.id,
                                'ticket_number', t.ticket_number,
                                'ticket_price',t.ticket_price
                            ))
                        FROM
                            ticket t
                        WHERE
                            t.order_id = o.id
                    )
                )
            ) AS orders
        FROM
            event e
        LEFT JOIN
            "order" o ON e.id = o.event_id left  join "user" artist on artist.id = e.artist_id  left  join "user" venue on venue.id = e.venue_id  left join booking_contract
            bc on bc.id = e.booking_contract_id left join user_question artist_uq
            on artist.id = artist_uq.user_id left join user_question venue_uq on venue.id=venue_uq.user_id left join countries artist_country on artist_uq.country_id =
            artist_country.id left join countries venue_country on venue_uq.country_id=venue_country.id left join cities artist_city on artist_uq.city_id = artist_city.id
left join cities venue_city on venue_uq.city_id=venue_city.id left join feedback f on f.user_id=o.user_id and  f.event_id=e.id
        WHERE
            o.user_id ='${user.id}' and o.order_status='COMPLETED' ${whereQuery}
        GROUP BY
            e.id, e.event_name,
                        e.start_time,
            e.end_time,
            e.ticket_price,
            artist.profile_image,
            artist_uq.band_name,
            artist_country.name,
            artist_city.name,
            artist.bio,
            venue_uq.venue_name,
            venue.profile_image,
            venue_country.name,
            venue_city.name,
            bc.music_genre,
            artist.id,
            venue.id,
            e.created_at,
            f.id 
            ${
              type == 'upcoming'
                ? 'order by e.start_time asc'
                : 'order by e.start_time desc'
            }
      ${pagination}
    ) AS subquery`);
    data = await this.userService.setUserCommonDetails(data);
    const count: [{ count: number }] = await this.dataSource.manager.query(
      `SELECT
    count(subquery.*) as count
FROM
    (
        SELECT
            e.id as event_id,
            e.event_name,
            cast(e.start_time as TEXT) as start_time,
            cast(e.end_time as TEXT) as end_time,
            e.ticket_price,
             artist.profile_image as artist_profile_image, artist_uq.band_name as artist_name,artist_country.name as artist_country,artist_city.name as artist_city,
artist.bio as artist_bio,venue_uq.venue_name as venue_name,venue.profile_image as venue_profile_image,venue_country.name as venue_country,venue_city.name
as venue_city,bc.music_genre,artist.id as artist_id,venue.id as venue_id,e.created_at as event_created_at,
            json_agg(
                json_build_object(
                    'id', o.id,
                    'quantity', o.quantity,
                    'quantity', o.quantity,
                    'order_status', o.order_status,
                    'invoice_number',o.invoice_number,
                    'total_price',o.total_price,
                    'tickets', (
                        SELECT
                            json_agg(json_build_object(
                                'id', t.id,
                                'ticket_number', t.ticket_number,
                                'ticket_price',t.ticket_price
                            ))
                        FROM
                            ticket t
                        WHERE
                            t.order_id = o.id
                    )
                )
            ) AS orders
        FROM
            event e
        LEFT JOIN
            "order" o ON e.id = o.event_id left  join "user" artist on artist.id = e.artist_id  left  join "user" venue on venue.id = e.venue_id  left join booking_contract
            bc on bc.id = e.booking_contract_id left join user_question artist_uq
            on artist.id = artist_uq.user_id left join user_question venue_uq on venue.id=venue_uq.user_id left join countries artist_country on artist_uq.country_id =
            artist_country.id left join countries venue_country on venue_uq.country_id=venue_country.id left join cities artist_city on artist_uq.city_id = artist_city.id
left join cities venue_city on venue_uq.city_id=venue_city.id left join feedback f on f.user_id=o.user_id and  f.event_id=e.id
        WHERE
            o.user_id ='${user.id}' and o.order_status='COMPLETED' ${whereQuery}
        GROUP BY
            e.id, e.event_name,
                        e.start_time,
            e.end_time,
            e.ticket_price,
            artist.profile_image,
            artist_uq.band_name,
            artist_country.name,
            artist_city.name,
            artist.bio,
            venue_uq.venue_name,
            venue.profile_image,
            venue_country.name,
            venue_city.name,
            bc.music_genre,
            artist.id,
            venue.id,
            e.created_at

    ) AS subquery`,
    );

    return new BookingOrderListDto().getList(
      data,
      isArray(count) ? count[0].count : 0,
      Number(page),
      Number(limit),
    );
  }
}
