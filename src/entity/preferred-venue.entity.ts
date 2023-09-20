import { BaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'preferred_venue' })
export class PreferredVenueEntity extends BaseEntity {
  @Column({ name: 'type', nullable: false, type: 'varchar', length: 255 })
  type: string;

  @Column({ name: 'image', nullable: true, type: 'text' })
  image: string;
}
