import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreateCalendarDto {
  @ApiProperty({
    examples: ['12:01'],
    description: 'Start time of the event',
  })
  @Matches(/^\s*([01][0-9]|2[0-3]):[0-5][0-9]\s*$/, {
    message: 'Start time must be in HH:mm format',
  })
  startTime: string;
  @ApiProperty({
    examples: ['22:22'],
    description: 'Start time of the event',
  })
  @Matches(/^\s*([01][0-9]|2[0-3]):[0-5][0-9]\s*$/, {
    message: 'End time must be in HH:mm format',
  })
  endTime: string;

  @ApiProperty({
    examples: ['Event title'],
    description: 'Title of the event',
  })
  title: string;

  @ApiProperty({
    examples: ['2023-01-23'],
    description: 'Date',
  })
  date: string;

  @ApiProperty({
    examples: ['Event description'],
    description: 'Description of the event',
  })
  description: string;
}
