import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get country list',
  })
  @ApiOkResponse({
    description: 'Return  list ',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('country')
  async getCountry() {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.locationService.getCountry(),
      );
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get city list',
  })
  @ApiOkResponse({
    description: 'Return  list`',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('city')
  async getCity(@Query('countryId') countryId: string) {
    try {
      return new StandardResponse(
        HttpStatus.OK,
        SUCCESS_MESSAGES.SUCCESS,
        await this.locationService.getCity(countryId),
      );
    } catch (e) {
      throw e;
    }
  }
}
