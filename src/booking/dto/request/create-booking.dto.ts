import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  genreType: number[];

  @ApiProperty()
  message: string;

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
    examples: ['2023-01-23'],
    description: 'Date',
  })
  date: string;

  @ApiProperty()
  minimumPrice: number;
  @ApiProperty()
  maximumPrice: number;
}
