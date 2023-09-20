import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty()
  userId: number;
}
