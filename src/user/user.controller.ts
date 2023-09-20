import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AddUserTypeDto } from './dto/request/add-user-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
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
import { UserProfileDto } from './dto/response/user-profile.dto';

@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiBody({ type: AddUserTypeDto })
  @ApiOperation({
    summary: 'Update user user type',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @HttpCode(HttpStatus.OK)
  @Put('user-type')
  async addUserType(
    @Usr() user: AuthUser,
    @Body() addUserTypeDto: AddUserTypeDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.addUserType(user, addUserTypeDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile details',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response with details',
    type: UserProfileDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getCurrentProfile(@Usr() user: AuthUser) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getCurrentProfile(user),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user gallery',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response with image list',
    type: UserProfileDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get('gallery')
  async getCurrentUserGallery(@Usr() user: AuthUser) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getCurrentUserGallery(user),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user gallery by id',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response with image list',
    type: UserProfileDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get('gallery/:id')
  async getUserGalleryById(@Param('id') id: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getUserGalleryById(+id),
      );
    } catch (e) {
      throw e;
    }
  }

  //get one by id nest js controller

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get consumer user recommendation and discovery',
  })
  @ApiOkResponse({
    description: 'Return recommendations or discovery list with details',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    type: String,
    example: ['1', '2', '3'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: ['event_name'],
  })
  @HttpCode(HttpStatus.OK)
  @Get('consumer/recommendation')
  async getConsumerRecommendations(
    @Usr() user: AuthUser,
    @Query('genre') genre: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getConsumerRecommendations(
          user,
          genre,
          search,
          page,
          limit,
        ),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user recommendations',
  })
  @ApiOkResponse({
    description: 'Return recommendations list with details',
  })
  @HttpCode(HttpStatus.OK)
  @Get('recommendation')
  async getUserRecommendations(
    @Usr() user: AuthUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getUserRecommendations(user, page, limit),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user discover list',
  })
  @ApiOkResponse({
    description: 'Return discover list with details',
  })
  @HttpCode(HttpStatus.OK)
  @Get('discover')
  async getUserDiscovery(
    @Usr() user: AuthUser,
    @Query('type') type: string,
    @Query('typeId') typeId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getUserDiscovery(
          user,
          type,
          typeId,
          page,
          limit,
          search,
        ),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user details by id',
  })
  @ApiOkResponse({
    description: 'Return user details',
  })
  @Get(':id')
  async getOne(@Param('id') id: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.userService.getOne(+id),
      );
    } catch (e) {
      throw e;
    }
  }
}
