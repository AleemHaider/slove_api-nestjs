import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCalendarDto } from './dto/request/create-calendar.dto';
import { UpdateCalendarDto } from './dto/request/update-calendar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CalendarEntity } from '../entity/calendar.entity';
import ERROR_MESSAGES from '../util/error-messages';
import * as dayjs from 'dayjs';
import { UserEntity } from '../entity/user.entity';
import { getWhereListCalendar } from './util/find-all-where';
import { CalendarListResponseDto } from './dto/response/calendar-list-response.dto';
import { CALENDAR_TYPE, STATUS } from '../util/constant';
import { CalendarResponseDto } from './dto/response/calendar.response.dto';

@Injectable()
export class CalendarService {
  private logger: Logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEntity)
    private readonly calendarEntityRepository: Repository<CalendarEntity>,
    private readonly dataSource: DataSource,
  ) {}
  async create(currentUser: UserEntity, dto: CreateCalendarDto) {
    this.logger.log({ dto });

    try {
      // this.logger.log(dayjs().format('YYYY-MM-DD'));
      const calendarEntity = new CalendarEntity();
      calendarEntity.startTime = new Date(dto.date + ' ' + dto.startTime);
      calendarEntity.endTime = new Date(dto.date + ' ' + dto.endTime);
      this.logger.log(
        dayjs().format('YYYY-MM-DD') + ' ' + dto.startTime + ':00',
      );

      calendarEntity.user = currentUser;
      calendarEntity.title = dto.title;
      calendarEntity.description = dto.description;
      this.logger.log({ calendarEntity });
      await this.calendarEntityRepository.save(calendarEntity);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userId: string, startDate, endDate, type: CALENDAR_TYPE) {
    // this.logger.log(userId);
    try {
      const { query, limit } = getWhereListCalendar(
        userId,
        startDate,
        endDate,
        type,
      );
      this.logger.log('whereQuery', query);
      const data = await this.dataSource.manager.query(
        `select cast(c.start_time as TEXT) as start_time,cast(c.end_time as text) as end_time, id as id,title,description,c.type as type from calendar
        c where c.status='ACTIVE'  ${query} order by c.start_time asc ${limit}`,
      );
      // this.logger.log({ data });
      return new CalendarListResponseDto(data).getList();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // c.user_id=70 and and(start_time >='2023-01-01' and end_time < '2023-01-31');
  async findOne(id: number) {
    const calendarEntity = await this.calendarEntityRepository.findOne({
      where: {
        id: id,
        status: STATUS.ACTIVE,
      },
    });
    if (!calendarEntity) {
      throw new InternalServerErrorException(ERROR_MESSAGES.CALENDAR_NOT_FOUND);
    }
    return new CalendarResponseDto(calendarEntity).getCalendar();
  }

  async update(currentUser: UserEntity, dto: UpdateCalendarDto) {
    const calendarEntity = await this.calendarEntityRepository.findOne({
      where: {
        id: dto.id,
        user: {
          id: currentUser.id,
        },
      },
    });
    if (!calendarEntity) {
      throw new NotFoundException(ERROR_MESSAGES.CALENDAR_NOT_FOUND);
    }
    try {
      if (dto.startTime && dto.date) {
        calendarEntity.startTime = new Date(dto.date + ' ' + dto.startTime);
      }
      if (dto.endTime && dto.date) {
        calendarEntity.endTime = new Date(dto.date + ' ' + dto.endTime);
      }
      calendarEntity.title = dto.title;
      calendarEntity.description = dto.description;
      await this.calendarEntityRepository.save(calendarEntity);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(currentUser: UserEntity, id: number) {
    const calendarEntity = await this.calendarEntityRepository.findOne({
      where: {
        id: id,
        status: STATUS.ACTIVE,
        user: {
          id: currentUser.id,
        },
      },
    });
    if (!calendarEntity) {
      throw new NotFoundException(ERROR_MESSAGES.CALENDAR_NOT_FOUND);
    }
    try {
      await this.calendarEntityRepository.remove(calendarEntity);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
