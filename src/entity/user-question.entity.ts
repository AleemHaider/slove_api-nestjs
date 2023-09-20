import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { CountriesEntity } from './countries.entity';
import { CitiesEntity } from './cities.entity';

@Entity({ name: 'user_question' })
export class UserQuestionEntity extends BaseEntity {
  @Column({ name: 'band_name', type: 'varchar', length: 100, nullable: true })
  bandName: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ name: 'mobile_phone', type: 'varchar', length: 50, nullable: true })
  mobilePhone: string;

  @Column({ name: 'active_time', type: 'varchar', nullable: true })
  activeTime: string;

  @Column({ name: 'gigs', type: 'int', nullable: true })
  gigs: number;

  @Column({ name: 'booking_price', type: 'numeric', nullable: true })
  bookingPrice: number;

  @Column({ name: 'audioUrl', type: 'varchar', nullable: true })
  audioUrl:string;



  @Column({
    name: 'website_link',
    type: 'text',
    nullable: true,
  })
  websiteLink: string;

  @Column({
    name: 'social_media_link',
    type: 'text',
    nullable: true,
  })
  socialMediaLink: string;

  @Column({
    name: 'spotify',
    type: 'text',
    nullable: true,
  })
  spotify: string;

  @Column({
    name: 'facebook',
    type: 'text',
    nullable: true,
  })
  facebook: string;
  @Column({
    name: 'instagram',
    type: 'text',
    nullable: true,
  })
  instagram: string;
  @Column({
    name: 'youtube',
    type: 'text',
    nullable: true,
  })
  youtube: string;

  @Column({
    name: 'additional_links',
    type: 'text',
    nullable: true,
  })
  additionalLinks: string;

  @Column({ name: 'step', type: 'int', nullable: true })
  step: number;

  @Column({
    name: 'organization_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  organizationName: string;

  @Column({
    name: 'venue_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  venueName: string;

  @Column({
    name: 'street_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  streetName: string;

  @Column({
    name: 'venue_capacity',
    type: 'int',
    nullable: true,
  })
  venueCapacity: number;

  @Column({
    name: 'live_performance_per_month',
    type: 'int',
    nullable: true,
  })
  livePerformancePerMonth: number;

  @Column({
    name: 'peak_season',
    type: 'varchar',
    nullable: true,
  })
  peakSeason: string;

  @Column({
    name: 'musician_exposure',
    type: 'text',
    nullable: true,
  })
  musicianExposure: string;

  @Column({
    name: 'social_media_followers',
    type: 'int',
    nullable: true,
  })
  socialMediaFollowers: number;

  @Column({
    name: 'average_pay_per_gig',
    type: 'numeric',
    nullable: true,
  })
  averagePayPerGig: number;

  @Column({
    name: 'follower_count',
    type: 'int',
    nullable: true,
  })
  followerCount: number;

  @Column({
    name: 'rating',
    type: 'numeric',
    nullable: true,
  })
  rating: number;
  @Column({
    name: 'opening_start_at',
    type: 'time',
    nullable: true,
  })
  openingStartAt: string;

  @Column({
    name: 'opening_end_at',
    type: 'time',
    nullable: true,
  })
  openingEndAt: string;

  @Column({
    name: 'consumer_name',
    type: 'varchar',
    nullable: true,
  })
  consumerName: string;

  @Column({
    name: 'phone_code',
    type: 'varchar',
    nullable: true,
  })
  phoneCode: string;

  @Column({
    name: 'country_code',
    type: 'varchar',
    nullable: true,
  })
  countryCode: string;

  @ManyToOne(() => CountriesEntity, (country) => country.userQuestion)
  @JoinColumn({ name: 'country_id' })
  countryId: CountriesEntity;

  @ManyToOne(() => CitiesEntity, (city) => city.userQuestion)
  @JoinColumn({ name: 'city_id' })
  cityId: CitiesEntity;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
