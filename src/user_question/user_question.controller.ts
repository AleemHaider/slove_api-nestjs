import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserQuestionService } from './user_question.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AddAnswersDto } from './dto/request/add-answers.dto';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
import { UpdateAnswersDto } from './dto/request/update-answers.dto';

@ApiTags('User Question')
@Controller('user-question')
export class UserQuestionController {
  constructor(private readonly userQuestionService: UserQuestionService) {}

  @ApiBody({ type: AddAnswersDto })
  @ApiOperation({
    summary:
      'Add user answers step by step,1,2,3.(refer postman collection for more details)',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return `Success` as a response.',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post()
  async addAnswer(@Usr() user: AuthUser, @Body() addAnswersDto: AddAnswersDto) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userQuestionService.addAnswer(user, addAnswersDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Get Current User answers',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Return `Question answers` as a response.last finished step will be returned.',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getCurrentUserAnswers(@Usr() user: AuthUser) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userQuestionService.getCurrentUserAnswers(user),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBody({ type: UpdateAnswersDto })
  @ApiOperation({
    summary: 'Update Current User answers',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateCurrentUserAnswers(
    @Usr() user: AuthUser,
    @Body() userAnswersDto: UpdateAnswersDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userQuestionService.updateCurrentUserAnswers(
          user,
          userAnswersDto,
        ),
      );
    } catch (e) {
      throw e;
    }
  }
}
