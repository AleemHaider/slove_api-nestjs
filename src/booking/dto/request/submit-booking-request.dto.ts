import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_STATUS } from '../../../util/constant';
import { IsEnum } from 'class-validator';

export class SubmitBookingRequestDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    description: 'booking status',
    enum: BOOKING_STATUS,
  })
  @IsEnum(BOOKING_STATUS)
  status: BOOKING_STATUS;
}
