import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { CreateOrderDto } from '../order/dto/request/create-order.dto';
import { EventEntity } from '../entity/event.entity';
@Injectable()
export class StripeService {
  private logger: Logger = new Logger(StripeService.name);

  readonly stripe: Stripe;

  constructor(readonly configService: ConfigService) {
    this.logger.log('stripe initialized');
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-11-15',
    });
  }

  async createPaymentIntent(
    orderRequest: CreateOrderDto,
    event: EventEntity,
    invoiceNumber: string,
    email: string,
    name: string | null,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    try {
      const payment = await this.stripe.paymentIntents.create({
        amount: event.ticketPrice * 100 * orderRequest.quantity,
        currency: 'SEK',
        payment_method_types: ['card'],
        metadata: {
          eventName: event.eventName,
          invoiceNumber: invoiceNumber,
          quantity: orderRequest.quantity,
          email: email,
          name: name ? name : '',
        },
      });
      this.logger.log({ payment });
      return payment;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
