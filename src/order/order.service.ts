/// <reference types="stripe-event-types" />
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from '../entity/event.entity';
import ERROR_MESSAGES from '../util/error-messages';
import { OrderEntity } from '../entity/order.entity';
import { UserEntity } from '../entity/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderResponseDto } from './dto/response/create-order-response.dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ORDER_STATUS } from '../util/constant';
import { TicketEntity } from '../entity/ticket.entity';
import generateTicketNumber from '../util/random-ticket-number';
import { UserQuestionEntity } from '../entity/user-question.entity';
@Injectable()
export class OrderService {
  private logger: Logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(EventEntity)
    private readonly eventEntityRepository: Repository<EventEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderEntityRepository: Repository<OrderEntity>,
    private stripeService: StripeService,
    private readonly configService: ConfigService,
    @InjectRepository(TicketEntity)
    private readonly ticketEntityRepository: Repository<TicketEntity>,
    @InjectRepository(UserQuestionEntity)
    private readonly userQuestionEntityRepository: Repository<UserQuestionEntity>,
    private readonly dataSource: DataSource,
  ) {}
  async create(currentUser: UserEntity, dto: CreateOrderDto) {
    const event = await this.eventEntityRepository.findOne({
      where: {
        id: dto.id,
      },
    });
    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT_NOT_FOUND);
    }

    const userDetails = await this.userQuestionEntityRepository.findOne({
      where: {
        user: {
          id: currentUser.id,
        },
      },
      select: ['id', 'consumerName'],
    });
    this.logger.log('Transaction started');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const invoiceNumber = await this.generateInvoiceNumber();

    try {
      let order = new OrderEntity();
      order.user = currentUser;
      order.event = event;
      order.quantity = dto.quantity;
      order.invoiceNumber = invoiceNumber;
      order.totalPrice = dto.quantity * event.ticketPrice;

      order = await queryRunner.manager.getRepository(OrderEntity).save(order);
      // order = await this.orderEntityRepository.save(order);
      const stripeResponse = await this.stripeService.createPaymentIntent(
        dto,
        event,
        invoiceNumber,
        currentUser.email,
        userDetails.consumerName,
      );
      order.stripeResponse = JSON.stringify(stripeResponse);
      order.paymentId = stripeResponse.id;
      // await this.orderEntityRepository.save(order);
      await queryRunner.manager.getRepository(OrderEntity).save(order);
      await queryRunner.commitTransaction();

      return new CreateOrderResponseDto(
        stripeResponse.id,
        stripeResponse.client_secret,
        stripeResponse.currency,
        event.eventName,
        event.id,
        invoiceNumber,
      );
    } catch (e) {
      this.logger.error(e);
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  async generateInvoiceNumber() {
    const yearSuffix: string = new Date().getFullYear().toString().slice(-2);

    const orderEntity = await this.orderEntityRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    if (!orderEntity) {
      return `INV${yearSuffix}-00001`;
    }

    const lastYear: number | null = orderEntity.invoiceNumber
      ? parseInt(orderEntity.invoiceNumber.slice(3, 5), 10)
      : null;

    let numericSuffix: string;

    if (lastYear && lastYear !== parseInt(yearSuffix, 10)) {
      numericSuffix = '00001';
    } else if (orderEntity.invoiceNumber) {
      const lastNumericSuffix: number = parseInt(
        orderEntity.invoiceNumber.slice(-5),
        10,
      );
      numericSuffix = (lastNumericSuffix + 1).toString().padStart(5, '0');
    } else {
      numericSuffix = '00001';
    }
    return `INV${yearSuffix}-${numericSuffix}`;
  }

  async generateTicketInvoiceNumber() {
    const ticketNumber = generateTicketNumber();
    const isExist = await this.ticketEntityRepository.findOne({
      where: {
        ticketNumber: ticketNumber,
      },
    });
    if (isExist) {
      await this.generateTicketInvoiceNumber();
    }
    return ticketNumber;
    // random(0, 100)
  }

  async stripeWebhook(signature: string, body: Buffer) {
    try {
      const event = (await this.stripeService.stripe.webhooks.constructEvent(
        body,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      )) as Stripe.DiscriminatedEvent;
      // this.logger.log({ event });

      if (event.type == 'payment_intent.succeeded') {
        const metadata = event.data.object.metadata;
        await this.updateOrderCompleted(metadata, event);
      }

      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.STRIPE_INTERNAL_ERROR,
      );
    }
  }

  async updateOrderCompleted(
    metadata: Stripe.Metadata,
    event: Stripe.DiscriminatedEvent,
  ) {
    this.logger.log({ metadata });

    // const dataObject = await event.data.object;

    // // const payment_id = dataObject['id'];
    // this.logger.log('payment_intent', payment_intent);
    // this.logger.log({ dataObject });
    // this.logger.log({ dataObject });
    if (!metadata) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
    const order = await this.orderEntityRepository.findOne({
      where: {
        invoiceNumber: metadata.invoiceNumber,
      },
      relations: ['user', 'event'],
    });
    this.logger.log({ order });

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }
    await this.orderEntityRepository.update(
      { id: order.id },
      {
        stripeWebhookResponse: JSON.stringify(event),
        orderStatus: ORDER_STATUS.COMPLETED,
      },
    );

    for (let i = 0; i < order.quantity; i++) {
      const ticket = new TicketEntity();
      ticket.user = order.user;
      ticket.order = order;
      ticket.ticketPrice = order.event.ticketPrice;
      ticket.ticketNumber = await this.generateTicketInvoiceNumber();
      await this.ticketEntityRepository.save(ticket);
    }
    return true;
  }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }
  //
  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
