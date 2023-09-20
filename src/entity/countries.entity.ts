import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CitiesEntity } from './cities.entity';
import { UserQuestionEntity } from './user-question.entity';

@Entity({ name: 'countries' })
export class CountriesEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @Column({
    name: 'iso3',
    type: 'varchar',
    nullable: true,
    length: 3,
  })
  iso3: string;

  @Column({
    name: 'numeric_code',
    type: 'varchar',
    nullable: true,
    length: 3,
  })
  numericCode: string;

  @Column({
    name: 'iso2',
    type: 'varchar',
    nullable: true,
    length: 2,
  })
  iso2: string;

  @Column({
    name: 'phone_code',
    type: 'varchar',
    nullable: true,
  })
  phoneCode: string;

  @Column({
    name: 'capital',
    type: 'varchar',
    nullable: true,
  })
  capital: string;

  @Column({
    name: 'currency',
    type: 'varchar',
    nullable: true,
  })
  currency: string;

  @Column({
    name: 'currency_name',
    type: 'varchar',
    nullable: true,
  })
  currencyName: string;
  

  @OneToMany(() => CitiesEntity, (cities) => cities.country)
  city: CitiesEntity[];

  @OneToMany(() => UserQuestionEntity, (uq) => uq.country)
  userQuestion: UserQuestionEntity[];
}
