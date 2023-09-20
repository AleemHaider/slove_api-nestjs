import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyMailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otp: string;
}
