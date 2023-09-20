import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_CONTRACT_STATUS } from '../../../util/constant';
import { IsEnum } from 'class-validator';

export class SubmitBookingContractRequestDto {
  @ApiProperty()
  id: number;
  @ApiProperty({
    description: 'booking status',
    enum: BOOKING_CONTRACT_STATUS,
  })
  @IsEnum(BOOKING_CONTRACT_STATUS)
  status: BOOKING_CONTRACT_STATUS;
}
