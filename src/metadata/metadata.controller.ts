import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasicGuard } from '../auth/auth-basic.strategy';

@ApiTags('metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @ApiOperation({
    summary: 'Get Chat secrets',
    description:
      'Send headers as `authorization` `Basic f7VnJpyZGUAWfFrB62svsn5WYjbQyedDjuDVEC5W7e4TNoqdPMa3U`',
  })
  @ApiOkResponse({
    description: "Return tokens . `swagger can't handle basic auth`",
  })
  @UseGuards(BasicGuard)
  @Get('chat')
  async getChatIds() {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.metadataService.getChatIds(),
      );
    } catch (e) {
      throw e;
    }
  }
}
