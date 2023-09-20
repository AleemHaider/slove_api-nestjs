import { BaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { EventEntity } from './event.entity';

@Entity({ name: 'feedback' })
export class FeedbackEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.feedback)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => EventEntity, (e) => e.feedback)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({
    name: 'overall_experience',
    type: 'smallint',
    nullable: true,
  })
  overallExperience: number;

  @Column({
    name: 'musicians_performance',
    type: 'smallint',
    nullable: true,
  })
  musiciansPerformance: number;

  @Column({
    name: 'attend_next_performance',
    type: 'smallint',
    nullable: true,
  })
  attendNextPerformance: number;

  @Column({
    name: 'organisation_aspects_of_event',
    type: 'smallint',
    nullable: true,
  })
  organisationAspectsOfEvent: number;
  @Column({
    name: 'visit_venue_again',
    type: 'smallint',
    nullable: true,
  })
  visitVenueAgain: number;

  @Column({
    name: 'cooperation_with_musician',
    type: 'smallint',
    nullable: true,
  })
  cooperationWithMusician: number;
  @Column({
    name: 'work_with_musician_again',
    type: 'smallint',
    nullable: true,
  })
  workWithMusicianAgain: number;
  @Column({
    name: 'cooperation_with_venue',
    type: 'smallint',
    nullable: true,
  })
  cooperationWithVenue: number;

  @Column({
    name: 'work_with_venue_again',
    type: 'smallint',
    nullable: true,
  })
  workWithVenueAgain: number;
}
//Would you work with venue again
