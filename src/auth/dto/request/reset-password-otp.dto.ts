import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  otp: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
