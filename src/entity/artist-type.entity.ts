import { BaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'artist_type' })
export class ArtistTypeEntity extends BaseEntity {
  @Column({ name: 'type', nullable: false, type: 'varchar', length: 255 })
  type: string;

  @Column({ name: 'image', nullable: true, type: 'text' })
  image: string;
}
