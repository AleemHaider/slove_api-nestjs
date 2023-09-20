import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { EventEntity } from './event.entity';
import { ORDER_STATUS } from '../util/constant';
import { TicketEntity } from './ticket.entity';

@Entity({ name: 'order' })
export class OrderEntity extends BaseEntity {
  @Column({ type: 'int', name: 'quantity', nullable: false })
  quantity: number;

  @Column({ type: 'text', name: 'payment_id', nullable: true })
  paymentId: string;
  @Column({ type: 'text', name: 'stripe_response', nullable: true })
  stripeResponse: string;
  @Column({ type: 'text', name: 'stripe_webhook_response', nullable: true })
  stripeWebhookResponse: string;
  @Column({
    type: 'varchar',
    name: 'invoice_number',
    length: 50,
    unique: true,
  })
  invoiceNumber: string;

  @Column({
    type: 'decimal',
    name: 'total_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  totalPrice: number;

  @ManyToOne(() => UserEntity, (user) => user.order)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => EventEntity, (e) => e.order)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.PENDING,
    name: 'order_status',
  })
  orderStatus: ORDER_STATUS;
  @OneToMany(() => TicketEntity, (o) => o.order)
  ticket: TicketEntity[];
}
