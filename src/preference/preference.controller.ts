import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('preference')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @ApiOperation({
    summary: 'Get Artist Type List',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return Artist List',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('artist')
  async getArtistList(@Query('search') search: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.preferenceService.getArtistList(search),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Get music genre List',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return music genre List',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('genre')
  async getMusicGenreList(@Query('search') search: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.preferenceService.getMusicGenreList(search),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiOperation({
    summary: 'Get preferred venue List',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return preferred venue List',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('venue')
  async getPreferredVenueList(@Query('search') search: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.preferenceService.getPreferredVenueList(search),
      );
    } catch (e) {
      throw e;
    }
  }
}
