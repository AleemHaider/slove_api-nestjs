import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'event id' })
  id: number;
  @ApiProperty({ description: 'ticket quantity' })
  quantity: number;
  @ApiProperty({ description: 'stripe response' })
  response: string;
}
