import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCalendarDto {
  @ApiProperty({
    example: 1,
    description: 'Id of the event',
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    examples: ['12:01'],
    description: 'Start time of the event',
  })
  startTime: string;
  @ApiProperty({
    examples: ['22:22'],
    description: 'Start time of the event',
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
