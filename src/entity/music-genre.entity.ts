import { BaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'music_genre' })
export class MusicGenreEntity extends BaseEntity {
  @Column({ name: 'type', nullable: false, type: 'varchar', length: 255 })
  type: string;

  @Column({ name: 'image', nullable: true, type: 'text' })
  image: string;
}
