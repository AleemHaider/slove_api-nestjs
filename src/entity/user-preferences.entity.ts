import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_preferences' })
export class UserPreferencesEntity extends BaseEntity {
  @Column('int', {
    array: true,
    default: {},
    name: 'artist_type',
    nullable: true,
  })
  artistType: number[];

  @Column('int', {
    array: true,
    default: {},
    name: 'music_genre',
    nullable: true,
  })
  musicGenre: number[];

  @Column('int', {
    array: true,
    default: {},
    name: 'preferred_venue',
    nullable: true,
  })
  preferredVenue: number[];

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
