import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddUserTypeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
