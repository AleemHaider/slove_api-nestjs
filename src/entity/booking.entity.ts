import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BOOKING_STATUS } from '../util/constant';

@Entity({ name: 'booking' })
export class BookingEntity extends BaseEntity {
  @Column({
    name: 'booking_status',
    type: 'enum',
    enum: BOOKING_STATUS,
    default: BOOKING_STATUS.PENDING,
  })
  bookingStatus: BOOKING_STATUS;
  @Column({
    name: 'message',
    type: 'text',
    nullable: true,
  })
  message: string;

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
    name: 'minimum_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  minimumPrice: number;

  @Column({
    type: 'decimal',
    name: 'maximum_price',
    default: 0,
    precision: 15,
    scale: 2,
  })
  maximumPrice: number;

  @ManyToOne(() => UserEntity, (user) => user.booking)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.booking)
  @JoinColumn({ name: 'requested_user_id' })
  requestedUser: UserEntity;
}
