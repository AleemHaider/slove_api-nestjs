import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'email_verification' })
export class EmailVerificationEntity extends BaseEntity {
  @Column({
    name: 'valid_until',
    type: 'timestamp without time zone',
    default: () => "(timezone('utc'::text, now()) + '2 days'::interval)",
  })
  validUntil: Date;

  @Column({ name: 'otp', type: 'varchar', nullable: false })
  otp: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
