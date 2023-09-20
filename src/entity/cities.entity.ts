import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CountriesEntity } from './countries.entity';
import { UserQuestionEntity } from './user-question.entity';

@Entity({ name: 'cities' })
export class CitiesEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @ManyToOne(() => CountriesEntity, (countries) => countries.city)
  @JoinColumn({ name: 'country_id' })
  country: CountriesEntity;

  @OneToMany(() => UserQuestionEntity, (uq) => uq.city)
  userQuestion: UserQuestionEntity[];
}
