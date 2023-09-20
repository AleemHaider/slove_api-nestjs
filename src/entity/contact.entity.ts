import { BaseEntity } from './base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'contact' })
export class ContactEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.contact)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.contactUsers)
  @JoinColumn({ name: 'contact_user_id' })
  contactUser: UserEntity;
}
