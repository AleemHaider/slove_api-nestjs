import { BaseEntity } from './base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BookingContractEntity } from './booking-contract.entity';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';
import { FeedbackEntity } from './feedback.entity';

@Entity({ name: 'event' })
export class EventEntity extends BaseEntity {
  @Column({
    name: 'event_name',
    type: 'text',
    nullable: true,
  })
  eventName: string;

  @Column({
    type: 'timestamp',
    name: 'start_time',
    nullable: true,
  })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time', nullable: true })
  endTime: Date;

  @Column({
    type: 'decimal',
    name: 'ticket_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  ticketPrice: number;

  @OneToOne(() => BookingContractEntity)
  @JoinColumn({ name: 'booking_contract_id' })
  bookingContract: BookingContractEntity;

  @ManyToOne(() => UserEntity, (user) => user.event_artist)
  @JoinColumn({ name: 'artist_id' })
  artist: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.event_venue)
  @JoinColumn({ name: 'venue_id' })
  venue: UserEntity;

  @OneToMany(() => OrderEntity, (o) => o.event)
  order: OrderEntity[];

  @OneToMany(() => FeedbackEntity, (f) => f.event)
  feedback: FeedbackEntity[];
}
