import { LoginResponseDto } from '../../../auth/dto/response/login-response.dto';

export class UserProfileDto extends LoginResponseDto {
  // @ApiProperty()
  // email: string;
  // @ApiProperty()
  // emailVerified: boolean;
  // @ApiProperty()
  // firstname: string;
  // @ApiProperty()
  // lastname: string;
  // @ApiProperty()
  // onboardingComplete: boolean;
  // @ApiProperty()
  // registerType: string;
  // @ApiProperty()
  // userType: number | null;
  chatId: number;

  constructor(
    email: string,
    emailVerified: boolean,
    registerType: string,
    firstname: string,
    lastname: string,
    onboardingComplete: boolean,
    userType: number | null,
    chatId: number,
  ) {
    super(
      email,
      emailVerified,
      registerType,
      firstname,
      lastname,
      onboardingComplete,
      userType,
    );
    this.chatId = chatId;
  }
}
