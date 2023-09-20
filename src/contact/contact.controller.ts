import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/request/create-contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { DeleteContactDto } from './dto/request/delete-contact.dto';

@ApiTags('contact')
@UseGuards(JwtAuthGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateContactDto })
  @ApiOperation({
    summary: 'Add new Contact to the user',
  })
  @ApiOkResponse({
    description: 'Return `Success` as a response',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Usr() user: AuthUser,
    @Body() createContactDto: CreateContactDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.contactService.create(user, createContactDto),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'find all Contact of the current user',
  })
  @ApiOkResponse({
    description:
      'Return contact list as a response. `send sort by as &sort=asc or &sort=desc. default is asc`',
  })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @HttpCode(HttpStatus.OK)
  @Get('current-user')
  async findCurrentUserAllContact(
    @Usr() user: AuthUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('userType') userType: string,
    @Query('search') search: string,
    @Query('sort') sort: string,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.contactService.findCurrentUserAllContact(
          user,
          page,
          limit,
          userType,
          search,
          sort,
        ),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiBody({ type: DeleteContactDto })
  @ApiOperation({
    summary: 'delete Contact of the current user',
  })
  @ApiOkResponse({
    description: 'Return `success`',
  })
  @HttpCode(HttpStatus.OK)
  @Put('delete')
  async remove(
    @Usr() user: AuthUser,
    @Body() deleteContactDto: DeleteContactDto,
  ) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.contactService.remove(user, deleteContactDto),
      );
    } catch (e) {
      throw e;
    }
  }
  // @Get()
  // findAll() {
  //   return this.contactService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.contactService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
  //   return this.contactService.update(+id, updateContactDto);
  // }
}
