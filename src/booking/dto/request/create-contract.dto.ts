import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ description: 'booking id' })
  id: number;
  @ApiProperty()
  genreType: number[];

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
  bookingPrice: number;

  @ApiProperty()
  organisationNumber: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  ticketPrice: number;

  @ApiProperty()
  equipment: string[];
}
