import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty({ description: 'please refer to' })
  @IsNumber()
  questionId: number;
  @ApiProperty()
  @IsNumber()
  answer: number;
}
