import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/request/create-order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StandardResponse } from '../common/dto/standard-response';
import SUCCESS_MESSAGES from '../util/success-messages';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Usr } from '../auth/user.decorator';
import { AuthUser } from '../auth/auth-user';
import { Request } from 'express';
@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: 'Create new Order',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Usr() user: AuthUser, @Body() createOrderDto: CreateOrderDto) {
    try {
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.orderService.create(user, createOrderDto),
      );
    } catch (e) {
      throw e;
    }
  }
  @ApiOperation({
    summary: 'Stripe Webhook event',
  })
  // @ApiBody({ type: CreateOrderDto })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return success',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      // console.log(request.headers['stripe-signature']);
      // const event = request.body;
      // console.log(event);
      return new StandardResponse(
        HttpStatus.CREATED,
        SUCCESS_MESSAGES.SUCCESS,
        await this.orderService.stripeWebhook(signature, request.rawBody),
      );
    } catch (e) {
      throw e;
    }
  }

  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
