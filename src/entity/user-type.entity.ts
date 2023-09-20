import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_type' })
export class UserTypeEntity extends BaseEntity {
  @Column({ name: 'type', type: 'varchar', length: 10, nullable: false })
  type: string;

  @OneToMany(() => UserEntity, (user) => user.userType)
  user: UserEntity[];
}
