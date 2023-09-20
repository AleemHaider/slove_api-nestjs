import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'password_reset' })
export class PasswordResetEntity extends BaseEntity {
  @Column({
    name: 'valid_until',
    type: 'timestamp without time zone',
    default: () => "(timezone('utc'::text, now()) + '2 days'::interval)",
  })
  validUntil: Date;

  @Column({ name: 'otp', type: 'varchar', nullable: false })
  otp: string;

  @ManyToOne(() => UserEntity, (user) => user.passwordReset)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
