import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_gallery' })
export class UserGalleryEntity extends BaseEntity {
  @Column('text', {
    array: true,
    default: {},
    name: 'images',
    nullable: true,
  })
  images: string[];

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
