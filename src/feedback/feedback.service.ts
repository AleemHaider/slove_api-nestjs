import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/request/create-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { FeedbackEntity } from '../entity/feedback.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { EventEntity } from '../entity/event.entity';

@Injectable()
export class FeedbackService {
  private logger: Logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackEntityRepository: Repository<FeedbackEntity>,
    @InjectRepository(EventEntity)
    private readonly eventEntityRepository: Repository<EventEntity>,
  ) {}
  async create(currentUser: UserEntity, dto: CreateFeedbackDto) {
    let feedbackEntity = await this.feedbackEntityRepository.findOne({
      where: {
        user: {
          id: currentUser.id,
        },
        event: {
          id: dto.eventId,
        },
      },
      relations: ['event'],
    });
    if (!feedbackEntity) {
      feedbackEntity = new FeedbackEntity();
      const event = await this.eventEntityRepository.findOne({
        where: {
          id: dto.eventId,
        },
      });
      if (!event) {
        throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
      }
      feedbackEntity.user = currentUser;
      feedbackEntity.event = event;
      // feedbackEntity.event=
    }

    try {
      switch (dto.questionId) {
        case 1:
          feedbackEntity.overallExperience = dto.answer;
          break;
        case 2:
          feedbackEntity.musiciansPerformance = dto.answer;
          break;
        case 3:
          feedbackEntity.attendNextPerformance = dto.answer;
          break;
        case 4:
          feedbackEntity.organisationAspectsOfEvent = dto.answer;
          break;
        case 5:
          feedbackEntity.visitVenueAgain = dto.answer;
          break;
        case 6:
          feedbackEntity.cooperationWithMusician = dto.answer;
          break;
        case 7:
          feedbackEntity.workWithMusicianAgain = dto.answer;
          break;
        case 8:
          feedbackEntity.cooperationWithVenue = dto.answer;
          break;
        case 9:
          feedbackEntity.workWithVenueAgain = dto.answer;
          break;
        default:
          break;
        // feedbackEntity.
      }
      await this.feedbackEntityRepository.save(feedbackEntity);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // findAll() {
  //   return `This action returns all feedback`;
  // }

  async findOne(id: number) {
    return await this.feedbackEntityRepository.find({
      where: {
        user: {
          id: id,
        },
      },
    });
  }

  // update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
  //   return `This action updates a #${id} feedback`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} feedback`;
  // }
}
