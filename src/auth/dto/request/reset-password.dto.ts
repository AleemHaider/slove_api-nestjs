import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEmail()
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
