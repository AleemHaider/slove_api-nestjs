import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/request/create-calendar.dto';
import { UpdateCalendarDto } from './dto/request/update-calendar.dto';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
import { CALENDAR_TYPE } from '../util/constant';

@ApiTags('calendar')
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateCalendarDto })
  @ApiOperation({
    summary: 'Add new event to calender',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Post()
  async create(
    @Usr() user: AuthUser,
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.create(user, createCalendarDto),
      );
    } catch (e) {
      throw e;
    }
  }
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user all calender events',
  })
  @ApiOkResponse({
    description: 'Return `Success` and list as response',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2023-01-31',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    example: ['CUSTOM', 'EVENT'],
  })
  @Get('current-user')
  async currentUserFindAll(
    @Usr() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: CALENDAR_TYPE,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.findAll(
          user.id + '',
          startDate,
          endDate,
          type,
        ),
      );
    } catch (e) {
      throw e;
    }
  }
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all calender events',
  })
  @ApiOkResponse({
    description: 'Return `Success` and list as response',
  })
  @ApiQuery({ name: 'userId', required: false, type: String, example: '70' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2023-01-31',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    example: ['CUSTOM', 'EVENT'],
  })
  @Get()
  async findAll(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type?: CALENDAR_TYPE,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.findAll(userId, startDate, endDate, type),
      );
    } catch (e) {
      throw e;
    }
  }
  //
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one calender events',
  })
  @ApiOkResponse({
    description: 'Return `Success` and and event details as response',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.findOne(+id),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateCalendarDto })
  @ApiOperation({
    summary: 'update calender event',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Put()
  async update(
    @Usr() user: AuthUser,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.update(user, updateCalendarDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'remove calender event from current user',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @Delete(':id')
  async remove(@Usr() user: AuthUser, @Param('id') id: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.calendarService.remove(user, +id),
      );
    } catch (e) {
      throw e;
    }
  }
}
