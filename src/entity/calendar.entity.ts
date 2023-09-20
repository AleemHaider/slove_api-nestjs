import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BookingContractEntity } from './booking-contract.entity';
import { CALENDAR_TYPE } from '../util/constant';

@Entity({ name: 'calendar' })
export class CalendarEntity extends BaseEntity {
  // @Column({ type: 'varchar', length: 500 })
  @Column({
    type: 'timestamp',
    name: 'start_time',
    nullable: true,
  })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time', nullable: true })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: CALENDAR_TYPE,
    default: CALENDAR_TYPE.CUSTOM,
    name: 'type',
  })
  type: CALENDAR_TYPE;

  @Column({ type: 'varchar', length: 500, name: 'title', nullable: true })
  title: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.calendar)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => BookingContractEntity, (bc) => bc.calendar, {
    nullable: true,
  })
  @JoinColumn({ name: 'booking_contract_id' })
  booking_contract: BookingContractEntity;
}
