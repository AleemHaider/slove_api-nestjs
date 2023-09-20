import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OneToMany } from 'typeorm';
import { PasswordResetEntity } from './password-reset.entity';
import { USER_REGISTER_TYPE } from '../util/constant';
import { UserTypeEntity } from './user-type.entity';
import { BookingEntity } from './booking.entity';
import { ContactEntity } from './contact.entity';
import { CalendarEntity } from './calendar.entity';
import { EventEntity } from './event.entity';
import { OrderEntity } from './order.entity';
import { TicketEntity } from './ticket.entity';
import { FeedbackEntity } from './feedback.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', nullable: true })
  password: string;

  @Column({
    name: 'email_verified',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  emailVerified: boolean;

  @Column({
    name: 'register_type',
    type: 'enum',
    enum: USER_REGISTER_TYPE,
    nullable: true,
  })
  registerType: USER_REGISTER_TYPE;

  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profileImage: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firstname: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastname: string;

  @Column({
    name: 'onboarding_complete',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  onboardingComplete: boolean;

  @Column({
    name: 'bio',
    type: 'text',
    nullable: true,
  })
  bio: string;

  @Column({
    name: 'token',
    type: 'text',
    nullable: true,
  })
  token: string;

  @Column({
    name: 'chat_id',
    type: 'int',
    nullable: true,
  })
  chatId: number;

  @OneToMany(() => PasswordResetEntity, (passwordReset) => passwordReset.user)
  passwordReset: PasswordResetEntity[];

  @ManyToOne(() => UserTypeEntity, (userType) => userType.user)
  @JoinColumn({ name: 'user_type_id' })
  userType: UserTypeEntity;

  @OneToMany(() => BookingEntity, (booking) => booking.user)
  booking: BookingEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.requestedUser)
  requestedBooking: BookingEntity[];

  @OneToMany(() => ContactEntity, (c) => c.user)
  contact: ContactEntity[];

  @OneToMany(() => ContactEntity, (c) => c.contactUser)
  contactUsers: ContactEntity[];

  @OneToMany(() => CalendarEntity, (c) => c.user)
  calendar: CalendarEntity[];

  @OneToMany(() => EventEntity, (photo) => photo.venue)
  event_venue: EventEntity[];
  @OneToMany(() => EventEntity, (photo) => photo.artist)
  event_artist: EventEntity[];

  @OneToMany(() => OrderEntity, (o) => o.user)
  order: OrderEntity[];

  @OneToMany(() => TicketEntity, (t) => t.user)
  ticket: TicketEntity[];

  @OneToMany(() => FeedbackEntity, (f) => f.user)
  feedback: FeedbackEntity[];
}
