import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from '../entity/event.entity';
import { OrderEntity } from '../entity/order.entity';
import { StripeModule } from '../stripe/stripe.module';
import { TicketEntity } from '../entity/ticket.entity';
import { UserQuestionEntity } from '../entity/user-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      OrderEntity,
      TicketEntity,
      UserQuestionEntity,
    ]),
    StripeModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
