import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEntity } from '../entity/feedback.entity';
import { EventEntity } from '../entity/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackEntity, EventEntity])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
