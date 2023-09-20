import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';

@Entity({ name: 'ticket' })
export class TicketEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.ticket)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => OrderEntity, (o) => o.ticket)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({
    type: 'decimal',
    name: 'ticket_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  ticketPrice: number;

  @Column({
    type: 'varchar',
    name: 'ticket_number',
    length: 50,
    unique: true,
  })
  ticketNumber: string;
}
