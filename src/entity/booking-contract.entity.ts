import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BookingEntity } from './booking.entity';
import { BOOKING_CONTRACT_STATUS } from '../util/constant';
import { CalendarEntity } from './calendar.entity';

@Entity({ name: 'booking_contract' })
export class BookingContractEntity extends BaseEntity {
  @Column('int', {
    array: true,
    default: {},
    name: 'music_genre',
    nullable: true,
  })
  musicGenre: number[];

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
    name: 'booking_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  bookingPrice: number;

  @Column({
    name: 'organisation_number',
    type: 'text',
    nullable: true,
  })
  organisationNumber: string;

  @Column({
    name: 'event_name',
    type: 'text',
    nullable: true,
  })
  eventName: string;

  @Column({
    type: 'decimal',
    name: 'ticket_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  ticketPrice: number;

  @Column({
    name: 'equipment',
    type: 'text',
    nullable: true,
    array: true,
    default: {},
  })
  equipment: string[];

  @Column({
    name: 'contract_status',
    type: 'enum',
    enum: BOOKING_CONTRACT_STATUS,
    default: BOOKING_CONTRACT_STATUS.PENDING,
  })
  contractStatus: BOOKING_CONTRACT_STATUS;

  @OneToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @OneToMany(() => CalendarEntity, (c) => c.booking_contract)
  calendar: CalendarEntity;
}
