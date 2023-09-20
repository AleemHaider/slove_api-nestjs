import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/request/create-feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiBody({ type: CreateFeedbackDto })
  @ApiOperation({
    summary: 'Add user feedback to a event.question ids are provided below',
    description:
      '1 .How would you rate your overall experience?  <br><br>' +
      '2 .How would you rate musicians performance?  <br><br>' +
      '3 .Would you attend this musicians next performance? <br><br>' +
      '4 .How do you rate organisation aspects of the event? <br><br>' +
      '5 .Would you visit this venue again?  <br><br>' +
      '6 .How would you rate cooperation with musician? <br><br>' +
      '7 .Would you work with musician again? <br><br>' +
      '8. How would you rate cooperation with venue? <br><br>' +
      '9 .Would you work with venue again? <br><br>',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Usr() user: AuthUser,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.feedbackService.create(user, createFeedbackDto),
      );
    } catch (e) {
      throw e;
    }
  }

  // @Get()
  // findAll() {
  //   return this.feedbackService.findAll();
  // }
  @ApiOperation({
    summary: 'get user all feedbacks (testing only)',
  })
  @ApiOkResponse({
    description: 'Return user list',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.feedbackService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateFeedbackDto: UpdateFeedbackDto,
  // ) {
  //   return this.feedbackService.update(+id, updateFeedbackDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.feedbackService.remove(+id);
  // }
}
