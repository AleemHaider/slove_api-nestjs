import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_REGISTER_TYPE } from '../../../util/constant';

export class SignupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsEnum(USER_REGISTER_TYPE)
  @ApiProperty()
  type: USER_REGISTER_TYPE;

  @ApiProperty()
  token: string;
}
