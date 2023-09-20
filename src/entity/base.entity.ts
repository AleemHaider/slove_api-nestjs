import { STATUS } from '../util/constant';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: STATUS,
    default: STATUS.ACTIVE,
  })
  status: STATUS;

  // @Column({ name: 'created_by', nullable: true })
  // createdBy: number;
  //
  // @Column({ name: 'updated_by', nullable: true })
  // updatedBy: number;
  //
  // @BeforeInsert()
  // setCreatedBy() {
  //   // Set the createdBy field to the id of the authenticated user
  //   this.createdBy = 1;
  // }
  //
  // @BeforeUpdate()
  // setUpdatedBy() {
  //   // Set the updatedBy field to the id of the authenticated user
  //   // this.updatedBy = getAuthenticatedUserId();
  //   this.updatedBy = 1;
  // }
}
